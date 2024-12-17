import { shortest_path } from "./shared/astar.ts";
import { pair_loop } from "./shared/itertools.ts";
import { Vector2 } from "./shared/Vector2.ts";


// MARK: Types
type RotationType = "clockwise"|"anti-clockwise";
type TranslationType = "next";
type DirectionType = "N"|"E"|"W"|"S"|"O";
export type Node = {
    pos:Vector2
    facing:DirectionType
    outbound:Map<RotationType|TranslationType|"Finish", Edge>
}
type Edge = {
    to:Node
    cost:0|1|1000
}
export type LoopyType<T=unknown> = IterableIterator<T>|Iterable<T>

// MARK: Helpers
const hash_node = (n:Vector2, direction:DirectionType) => `${direction}${n.x}|${n.y}`;
const direction_to_offset=(direction:DirectionType):Vector2=>{
    switch (direction){
        case "N":
            return {x:0, y:-1};
        case "S":
            return {x:0, y:1};
        case "E":
            return {x:1, y:0};
        case "W":
            return {x:-1, y:0};
        default:
            throw new Error("Failed to map");
    }
}

// MARK: Solve
function solve(input:string){
    const nodes:Map<string, Node> = new Map();

    const tiles = input.trim().split("\n").map(row=>row.split(""));
    const walls = new Set();
    let start_node:Node;
    let end_nodes:Node[];

    // MARK: Find Nodes
    tiles.forEach((row, y)=>row.forEach((cell, x)=>{
        if(cell==="#"){
            walls.add(Vector2.hash({x,y}))
        }else{
            const pos = {x,y};
            const clockwise:DirectionType[] = ["E","S","W","N"];
            const new_clockwise_nodes:Node[] = clockwise.map(facing=>({
                pos,
                facing,
                outbound:new Map()
            }));
            pair_loop(new_clockwise_nodes).forEach(([n1, n2])=>{
                n1.outbound.set("clockwise", {to:n2, cost:1000});
                n2.outbound.set("anti-clockwise", {to:n1, cost:1000});
            })
            new_clockwise_nodes.forEach(node=>nodes.set(hash_node(node.pos,node.facing), node));
            if(cell==="S"){
                start_node = new_clockwise_nodes[0];
            }else if(cell==="E"){
                end_nodes = new_clockwise_nodes;
            }
        }
    }));

    // MARK: Build Edges
    for(const node of nodes.values()){
        const neighbor = nodes.get(hash_node(
            Vector2.add(node.pos,direction_to_offset(node.facing)),
            node.facing
        ));
        if(neighbor){
            node.outbound.set("next", {to:neighbor, cost:1})
        }
    }
    // Construct a finish node that costs nothing to get to
    const finish_node:Node = {
        facing:"O",
        outbound:new Map(),
        pos:end_nodes![0].pos
    }
    for(const end_node of end_nodes!){
        end_node.outbound.set("Finish", {to:finish_node, cost:0})
    }
    
    // MARK: Path Finding
    // console.log("start", start_node!);
    // console.log("finsih", finish_node);
    const {cost, path} = shortest_path({
        start:start_node!,
        goal:finish_node,
        adjacent:node=>node.outbound.values().toArray(),
        heuristic:node=>{
            const a = node.pos;
            const b = finish_node.pos;
            const xd = Math.abs(a.x - b.x);
            const yd = Math.abs(a.y - b.y);
            const turn = (xd>0 && yd>0) ? 1000 : 0;
            return xd+yd+turn;
        },
        node_to_hash:node=>hash_node(node.pos,node.facing)
    });
    
    return {
        tiles,
        cost,
        path
    };
}


const {tiles, cost, path} = solve(`
###############
#.......#....E#
#.#.###.#.###.#
#.....#.#...#.#
#.###.#####.#.#
#.#.#.......#.#
#.#.#####.###.#
#...........#.#
###.#.#####.#.#
#...#.....#.#.#
#.#.#.###.#.#.#
#.....#...#.#.#
#.###.#.#.#.#.#
#S..#.....#...#
###############
`)

//const {tiles, cost, path} = solve(await Deno.readTextFile("input.txt"));
console.log(cost)
//await draw_solution(path, tiles, cost);

