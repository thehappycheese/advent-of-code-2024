import { Vector2 } from "./util/Vector2.ts";
import { shortest_path } from "./util/astar.ts";
import {pairwise, zip} from "./util/itertools.ts"

type Edge={
    to:Node,
    type:Key,
    cost:number
}
type Node={
    layer:number,
    key:Key,
    pos:Vector2,
    outbound:Edge[]
}
const hash_node = (n:Node) => `${n.layer}/${n.pos.x}-${n.pos.y}`;
enum Key {
    k0="0",
    k1="1",
    k2="2",
    k3="3",
    k4="4",
    k5="5",
    k6="6",
    k7="7",
    k8="8",
    k9="9",
    UP="^",
    DOWN="v",
    LEFT="<",
    RIGHT=">",
    A="A"
}
const key_name = (k:Key)=>{
    switch(k){
        case Key.UP:
            return "^"
        case Key.DOWN:
            return "v"
        case Key.LEFT:
            return "<"
        case Key.RIGHT:
            return ">"
        case Key.A:
            return "A"
        default:
            return k.toString();
    }
}
const adjacent = (pos:Vector2)=>[
    {pos:{x:pos.x+1,y:pos.y}, type:Key.RIGHT},
    {pos:{x:pos.x,y:pos.y+1}, type:Key.DOWN},
    {pos:{x:pos.x-1,y:pos.y}, type:Key.LEFT},
    {pos:{x:pos.x,y:pos.y-1}, type:Key.UP},
]

const make_pad = (world_size:Vector2)=>(nodes:Node[])=>{
    const in_bounds = Vector2.in_bounds(world_size);
    const th = Vector2.hash_int(world_size);
    const hnode = new Map(nodes.map(n=>[th(n.pos), n]));
    for(const node of nodes.values()){
        adjacent(node.pos).filter(n=>in_bounds(n.pos)).forEach(adjacent_item => {
            const adjacent_node = hnode.get(th(adjacent_item.pos));
            if(adjacent_node){
                node.outbound.push({to:adjacent_node, cost:1, type:adjacent_item.type})
            }
        });
    }
    return nodes
};

// const doorpad = (layer:number) => {
//     const world_size = {x:3, y:4};
//     const in_bounds = Vector2.in_bounds(world_size);
//     const pad_keys:Node[] = [
//         {pos:{x:1,y:3}, layer, key:Key.k0, outbound:[]},
//         {pos:{x:2,y:3}, layer, key:Key.A, outbound:[]},
//         {pos:{x:0,y:2}, layer, key:Key.k1, outbound:[]},
//         {pos:{x:1,y:2}, layer, key:Key.k2, outbound:[]},
//         {pos:{x:2,y:2}, layer, key:Key.k3, outbound:[]},
//         {pos:{x:0,y:1}, layer, key:Key.k4, outbound:[]},
//         {pos:{x:1,y:1}, layer, key:Key.k5, outbound:[]},
//         {pos:{x:2,y:1}, layer, key:Key.k6, outbound:[]},
//         {pos:{x:0,y:0}, layer, key:Key.k7, outbound:[]},
//         {pos:{x:1,y:0}, layer, key:Key.k8, outbound:[]},
//         {pos:{x:2,y:0}, layer, key:Key.k9, outbound:[]},
//     ];
//     const th = Vector2.hash_int(world_size);
//     const hnode = new Map(pad_keys.map(n=>[th(n.pos), n]));
//     for(const node of pad_keys.values()){
//         adjacent(node.pos).filter(n=>in_bounds(n.pos)).forEach(n => {
//             const nn = hnode.get(th(n.pos));
//             if(nn){
//                 node.outbound.push({to:nn, cost:1, type:n.type})
//             }
//         });
//     }
//     return pad_keys
// }

// const dirpad = (layer:number) => {
//     const world_size = {x:3, y:2};
//     const in_bounds = Vector2.in_bounds(world_size);
//     const nodes:Node[] = [
//         {pos:{x:0,y:1}, layer, key:Key.LEFT, outbound:[]},
//         {pos:{x:1,y:1}, layer, key:Key.DOWN, outbound:[]},
//         {pos:{x:2,y:1}, layer, key:Key.RIGHT, outbound:[]},
//         {pos:{x:1,y:0}, layer, key:Key.UP, outbound:[]},
//         {pos:{x:2,y:0}, layer, key:Key.A, outbound:[]},
        
//     ];
//     const th = Vector2.hash_int(world_size);
//     const hnode = new Map(nodes.map(n=>[th(n.pos), n]));
//     for(const node of nodes.values()){
//         adjacent(node.pos).filter(n=>in_bounds(n.pos)).forEach(adjacent_item => {
//             const adjacent_node = hnode.get(th(adjacent_item.pos));
//             if(adjacent_node){
//                 node.outbound.push({to:adjacent_node, cost:1, type:adjacent_item.type})
//             }
//         });
//     }
//     return nodes
// }
const dirpad = (layer:number) => make_pad({x:3,y:2})([
    {pos:{x:0,y:1}, layer, key:Key.LEFT, outbound:[]},
    {pos:{x:1,y:1}, layer, key:Key.DOWN, outbound:[]},
    {pos:{x:2,y:1}, layer, key:Key.RIGHT, outbound:[]},
    {pos:{x:1,y:0}, layer, key:Key.UP, outbound:[]},
    {pos:{x:2,y:0}, layer, key:Key.A, outbound:[]},
    
]);
const doorpad = (layer:number) => make_pad({x:3,y:4})([
    {pos:{x:1,y:3}, layer, key:Key.k0, outbound:[]},
    {pos:{x:2,y:3}, layer, key:Key.A, outbound:[]},
    {pos:{x:0,y:2}, layer, key:Key.k1, outbound:[]},
    {pos:{x:1,y:2}, layer, key:Key.k2, outbound:[]},
    {pos:{x:2,y:2}, layer, key:Key.k3, outbound:[]},
    {pos:{x:0,y:1}, layer, key:Key.k4, outbound:[]},
    {pos:{x:1,y:1}, layer, key:Key.k5, outbound:[]},
    {pos:{x:2,y:1}, layer, key:Key.k6, outbound:[]},
    {pos:{x:0,y:0}, layer, key:Key.k7, outbound:[]},
    {pos:{x:1,y:0}, layer, key:Key.k8, outbound:[]},
    {pos:{x:2,y:0}, layer, key:Key.k9, outbound:[]},
])


const input = `
029A
980A
179A
456A
379A
`;

const chainpad = (pad_function:(layer: number) => Node[])=>(presses:Key[])=>{
    const pads = presses.map((_, layer)=>pad_function(layer));
    const start = pads[0].find(n=>n.key===Key.A)!;
    const goal:Node = {key:presses.at(-1)!, pos:{x:2,y:0},layer:presses.length,outbound:[]};
    pads.at(-1)?.find(n=>n.key===presses.at(-1))?.outbound.push({to:goal, cost:1, type:presses.at(-1)!});
    pairwise(zip(presses,pads)).forEach(([[press, pa],[_,pb]])=>{
        pa.find(n=>n.key===press)?.outbound.push({to:pb.find(n=>n.key===press)!, cost:1, type:Key.A})
    })
    const result = shortest_path({
        start,
        goal,
        adjacent:n=>n.outbound,
        heuristic:n=>Math.abs(n.pos.x-goal.pos.x)+Math.abs(n.pos.y-goal.pos.y)+Math.abs(n.layer-goal.layer),
        node_to_hash:hash_node
    })
    //return {pads, start, goal, path:result.path.map(p=>({node:p.node, next:p.next?.type}))}
    return result.path.flatMap(p=>p.next?[p.next.type]:[])
};
const chain_dirpad  = chainpad(dirpad);
const chain_doorpad  = chainpad(doorpad);
const path=(keys:Key[])=>chain_dirpad(chain_dirpad(chain_doorpad(keys)));

// console.log(chain_doorpad([Key.k0,Key.k2,Key.k9, Key.A]))
// console.log(chain_dirpad(chain_doorpad([Key.k0,Key.k2,Key.k9, Key.A])))
// console.log(chain_dirpad(chain_dirpad(chain_doorpad([Key.k0,Key.k2,Key.k9, Key.A]))))
//console.log(chain_dirpad(chain_dirpad(chain_doorpad([Key.k1, Key.A])))
console.log(input.trim().split("\n").map(i=>path(i.split("")).join("")))
console.log(input.trim().split("\n").map(i=>path(i.split("")).join("").length))
console.log(input.trim().split("\n").map(i=>parseFloat(i)*path(i.split("")).join("").length).reduce((a,b)=>a+b))