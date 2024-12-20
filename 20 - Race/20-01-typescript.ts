import { Vector2 } from "./util/Vector2.ts";
import { all_shortest_paths, shortest_path } from "./util/astar.ts";
import { draw_grid } from "./util/draw_grid.ts";

const input = `
###############
#...#...#.....#
#.#.#.#.#.###.#
#S#...#.#.#...#
#######.#.#.###
#######.#.#...#
#######.#.###.#
###..E#...#...#
###.#######.###
#...###...#...#
#.#####.#.###.#
#.#...#.#.#...#
#.#.#.#.#.#.###
#...#...#...###
###############
`;

enum Tile{
    Path,
    Wall
}

type Node = {
    pos:Vector2,
    type:Tile
}

const nodes:Map<number, Node> = new Map();

const tiles = input.trim().split("\n").map(row=>row.split(""));
const world_size:Vector2 = {x:tiles[0].length, y:tiles.length};
//const hash = Vector2.hash_int(world_size);
const hash = Vector2.hash_string;
const neighbors = Vector2.neighbors(world_size);
let start_node:Node;
let end_node:Node;


// MARK: Find Nodes
tiles.forEach((row, y)=>row.forEach((cell, x)=>{
    const pos = {x,y};
    let new_node = {pos, type:Tile.Path};
    if(cell==="#"){
        new_node.type = Tile.Wall;
    }
    nodes.set(hash(pos),new_node);
    if(cell==="S"){
        start_node = new_node;
    }else if(cell==="E"){
        end_node = new_node;
    }
}));


let result = all_shortest_paths({
    start:start_node!,
    goal:end_node!,
    adjacent: node=>neighbors(node.pos).map(pos=>nodes.get(hash(pos))!).filter(n=>n.type===Tile.Path).map(to=>({to, cost:1})),
    //adjacent: node=>neighbors(node.pos).map(pos=>nodes.get(hash(pos))!).map(to=>({to, cost:to.type===Tile.Path?1:65})),
    heuristic:node=>Math.abs(end_node.pos.x-node.pos.x)+Math.abs(end_node.pos.y-node.pos.y),
    node_to_hash:node=>hash(node.pos)
});
draw_grid(
    world_size,
    {
        "█":nodes.values().filter(n=>n.type===Tile.Wall).map(n=>n.pos).toArray(),
        "&":result.visited.values().map(h=>nodes.get(h)!).map(n=>n.pos).toArray()
    }
)
console.log(result.cost_g)