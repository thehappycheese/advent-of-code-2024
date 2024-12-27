import { NetKey } from "./components/NetKey.tsx";
import { NetSvg } from "./components/NetSvg.tsx";
import { pairwise, zip } from "./util/itertools.ts";
import { Vector2 } from "./util/Vector2.ts";

export type Edge = {
    to: Node,
    type: EdgeType,
    cost: number
}

export type Node = {
    layer: number,
    key: Key,
    facing:EdgeType,
    pos: Vector2,
    outbound: Edge[]
}

export const hash_node = (n: Node) => `${n.layer}/${n.facing}/${n.pos.x}-${n.pos.y}`;

export enum Key {
    k0 = "0",
    k1 = "1",
    k2 = "2",
    k3 = "3",
    k4 = "4",
    k5 = "5",
    k6 = "6",
    k7 = "7",
    k8 = "8",
    k9 = "9",
    U = "^",
    D = "v",
    L = "<",
    R = ">",
    A = "A"
}
export enum EdgeType {
    L = Key.L,
    R = Key.R,
    U = Key.U,
    D = Key.D,
    Rot = "Rot", // Between Directions
    Out = "A", // From Central Node
    In = "In", // To Central Node
    Layer = "Layer", // To Next Layer
}

export const key_positions_door: Map<Key, Vector2> = new Map([
    [Key.k7, { x: 0, y: 0 }], [Key.k8, { x: 1, y: 0 }], [Key.k9, { x: 2, y: 0 }],
    [Key.k4, { x: 0, y: 1 }], [Key.k5, { x: 1, y: 1 }], [Key.k6, { x: 2, y: 1 }],
    [Key.k1, { x: 0, y: 2 }], [Key.k2, { x: 1, y: 2 }], [Key.k3, { x: 2, y: 2 }],
    [Key.k0, { x: 1, y: 3 }], [Key.A, { x: 2, y: 3 }],
]);
export const key_positions_arrow: Map<Key, Vector2> = new Map([
    [Key.U, { x: 1, y: 0 }], [Key.A, { x: 2, y: 0 }],
    [Key.L, { x: 0, y: 1 }], [Key.D, { x: 1, y: 1 }], [Key.R, { x: 2, y: 1 }],
]);
const key_dist = (a: Key, b: Key) => Vector2.L1(
    Vector2.sub(key_positions_arrow.get(a)!, key_positions_arrow.get(b)!)
);

const edge_type_to_key = (edge: EdgeType) => {
    switch (edge) {
        case EdgeType.L:
            return Key.L
        case EdgeType.R:
            return Key.R
        case EdgeType.U:
            return Key.U
        case EdgeType.D:
            return Key.D
        case EdgeType.Layer:
            return Key.A
        default:
            throw new Error(`This should never be called with EdgeType ${edge}`);
    }
}

const create_key = ({key,pos,layer}:{key: Key, pos: Vector2, layer: number}): Map<EdgeType, Node> => {
    const keys: Map<EdgeType, Node> = new Map([
        [EdgeType.L,   { facing:EdgeType.L  , layer, key, pos, outbound: [] }],
        [EdgeType.R,   { facing:EdgeType.R  , layer, key, pos, outbound: [] }],
        [EdgeType.U,   { facing:EdgeType.U  , layer, key, pos, outbound: [] }],
        [EdgeType.D,   { facing:EdgeType.D  , layer, key, pos, outbound: [] }],
        [EdgeType.Out, { facing:EdgeType.Out, layer, key, pos, outbound: [] }],
        [EdgeType.In,  { facing:EdgeType.In , layer, key, pos, outbound: [] }],
    ]);

    const rotation_links = [
        EdgeType.L,
        EdgeType.R,
        EdgeType.U,
        EdgeType.D,
    ];

    const central_node_outbound = keys.get(EdgeType.Out)!;
    const central_node_inbound  = keys.get(EdgeType.In)!;
    for (const a of rotation_links) {
        const node_a = keys.get(a)!;
        const dist_to_A = key_dist(edge_type_to_key(a), Key.A);
        node_a.outbound.push({ to: central_node_outbound, type: EdgeType.Out, cost:  dist_to_A});
        central_node_inbound.outbound.push({to:node_a, type:EdgeType.In, cost: dist_to_A})
        for (const b of rotation_links) {
            if (a === b) continue;
            const node_b = keys.get(b)!;
            node_a.outbound.push({
                to: node_b,
                type: EdgeType.Rot,
                cost: key_dist(edge_type_to_key(a), edge_type_to_key(b))*5
            })
        }
    }

    return keys
}
const nebs = (v:Vector2)=>new Map([
    [EdgeType.L, {x:v.x-1, y:v.y}],
    [EdgeType.R, {x:v.x+1, y:v.y}],
    [EdgeType.U, {x:v.x, y:v.y-1}],
    [EdgeType.D, {x:v.x, y:v.y+1}],
])
export const create_keypad = (layer:number)=>(pad_layout:Map<Key, Vector2>)=>{
    const nodes = new Map(
        pad_layout
        .entries()
        .flatMap(([key, pos])=>create_key({key, pos, layer}).values().toArray())
        .map(n=>[hash_node(n),n])
    );
    const pad_size:Vector2 = {x:3, y:2};
    //const inbounds = Vector2.in_bounds(pad_size);
    const hashpos = Vector2.hash_int(pad_size);
    //const nmap = new Map(nodes.values().map(n=>[hashpos(n.pos),n]));
    const nmap = Map.groupBy(nodes.values(), n=>hashpos(n.pos));
    for(const node of nodes.values()){
        if(node.facing === EdgeType.Out) continue;
        nebs(node.pos)
            .entries()
            //.filter(([_,p])=>inbounds(p))
            .forEach(([edge_type, npos])=>{
                const hneb = hashpos(npos);
                if(nmap.has(hneb)){
                    const neb = nmap.get(hneb)!.find(n=>{
                        if(n.facing===node.facing){
                            switch(node.facing){
                                case EdgeType.L:
                                    return n.pos.x<node.pos.x;
                                case EdgeType.R:
                                    return n.pos.x>node.pos.x;
                                case EdgeType.U:
                                    return n.pos.y<node.pos.y;
                                case EdgeType.D:
                                    return n.pos.y>node.pos.y;
                                case EdgeType.Layer:
                                case EdgeType.Out:
                                case EdgeType.Rot:
                                    return false
                            }
                        }
                        return false;
                    });
                    if(neb){
                        node.outbound.push({to:neb, cost:1, type:edge_type})
                    }
                }
            });
    }
    return nodes
}

export const create_keypad_sequence = (pad_layout:Map<Key, Vector2>)=>(key_sequence:Key[], start_key:Key=Key.A)=>{
    const pads = key_sequence.map((_, index)=>create_keypad(index)(pad_layout).values().toArray())
    zip(pairwise(pads), key_sequence).forEach(([[a,b],key])=>{
        a.find(node=>node.key===key && node.facing===EdgeType.Out)!.outbound.push({
            to:b.find(node=>node.key===key && node.facing===EdgeType.In)!,
            cost:1,
            type:EdgeType.Layer
        })
    })
    const start_node = pads[0].find(node=>node.key===start_key && node.facing!==EdgeType.In)!;
    const end_node:Node = pads.at(-1)!.find(node=>node.key===key_sequence.at(-1)! && node.facing===EdgeType.Out)!
    return {nodes:[start_node, ...pads.flat()], start_node, end_node}
}




export const draw_network = ({nodes, start_node, end_node}:{nodes:Node[], start_node:Node, end_node:Node}) =>
    (out_path:string="./JUNK/out_view.svg") =>
    {
    let result_nodes = "";
    let result_edges = "";
    const SQUARE = 80;
    const GAP = 30;
    const GRID = SQUARE+GAP;
    const OFFSET = {x:80, y:100};

    const get_edge_type_offset = (node_facing:EdgeType):Vector2 => {
        const M = SQUARE/2;
        switch(node_facing){
            case EdgeType.L:
                return {x:-M,y:0};
            case EdgeType.R:
                return {x: M,y:0};
            case EdgeType.U:
                return {x:0,y:-M};
            case EdgeType.D:
                return {x:0,y: M};
            case EdgeType.Out:
                return {x:M,y:M}
            case EdgeType.In:
                return {x:-M,y:-M}
            case EdgeType.Rot:
            case EdgeType.Layer:
                throw new Error("unhandled?")
        }
    }
    const get_node_position = (node:Node) => Vector2.add(
        Vector2.scale(node.pos, GRID),
        Vector2.add(
            {x:node.layer*(GRID*3+GAP), y:0},
            get_edge_type_offset(node.facing)
        )
    );

    nodes.forEach(node=>{
        const node_pos = get_node_position(node);
        let node_color = "#333";
        if(node === start_node || node===end_node){
            node_color="goldenrod"
        }
        result_nodes+= NetKey({
            pos:node_pos, 
            size:{x:SQUARE/3, y:SQUARE/3},
            label:node.facing.at(0)!,
            key:node.key,
            color:node_color,
        })
        for(const edge of node.outbound){
            const enode_pos = get_node_position(edge.to);
            // if(edge.to===end_node){
            //     enode_pos.y-=40
            // }
            let A = node_pos;
            let B = enode_pos;
            let diff = Vector2.sub(B, A);
            let dir = Vector2.unit(diff)
            A = Vector2.add(A, Vector2.scale(dir, SQUARE/10))
            B = Vector2.add(B, Vector2.scale(dir, -SQUARE/10))
            diff = Vector2.sub(B, A);

            const ldiff = Vector2.scale(Vector2.left(diff), 0.3);
            const H1 = Vector2.add(A,  Vector2.add(Vector2.scale(Vector2.left(diff),0.3), Vector2.scale(diff, 0.2)));
            const H2 = Vector2.add(B,  Vector2.add(Vector2.scale(Vector2.left(diff),0.0), Vector2.scale(diff, -0.2)));
            const kind = (type:EdgeType)=>{
                switch(type){
                    case EdgeType.In:
                        return "red"
                    case EdgeType.Out:
                        return "orange"
                    case EdgeType.Rot:
                        return "green"
                    default:
                        return "grey"
                }
            }
            const mpos=Vector2.add(Vector2.add(A, Vector2.scale(diff,0.5)), Vector2.scale(ldiff,0.3));
            result_edges+=`<g>
                <path
                    style="fill:none;stroke-width:1px;stroke:${kind(edge.type)};"
                    marker-end="url(#arrow)"
                    d="M ${A.x} ${A.y} C ${H1.x} ${H1.y} ${H2.x} ${H2.y} ${B.x} ${B.y}"
                />
                <text
                    x="${mpos.x}"
                    y="${mpos.y}"
                    font-size="0.3em"
                    text-anchor="middle"
                    dominant-baseline="central"
                    fill="${kind(edge.type)}"
                >${edge.cost}</text>
            </g>`;
        }
    })

    let out_svg = NetSvg(
        {x:0,y:0},
        {x:2000, y:500},
        `<g
            transform="translate(${OFFSET.x} ${OFFSET.y})"
        >${result_nodes+result_edges}</g>
        `
    );
    Deno.writeTextFile(out_path,out_svg)
}

