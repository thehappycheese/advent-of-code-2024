import { Vector2 } from "./util/Vector2.ts";
import { shortest_path } from "./util/astar.ts";
import { draw_double_grid, draw_grid } from "./util/draw_grid.ts";

const input = await Deno.readTextFile("input.txt");
// const input = `
// ###############
// #...#...#.....#
// #.#.#.#.#.###.#
// #S#...#.#.#...#
// #######.#.#.###
// #######.#.#...#
// #######.#.###.#
// ###..E#...#...#
// ###.#######.###
// #...###...#...#
// #.#####.#.###.#
// #.#...#.#.#...#
// #.#.#.#.#.#.###
// #...#...#...###
// ###############
// `;

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
const in_bounds = Vector2.in_bounds(world_size);
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

const adjacent = (node:Node) => neighbors(node.pos)
    .map(pos=>nodes.get(hash(pos))!)
    .filter(n=>n.type===Tile.Path)
    .map(to=>({to, cost:1}));

let result = shortest_path({
    start:start_node!,
    goal:end_node!,
    adjacent,
    heuristic:node=>Math.abs(end_node.pos.x-node.pos.x)+Math.abs(end_node.pos.y-node.pos.y),
    node_to_hash:node=>hash(node.pos)
});

const cheat_spots = (position:Vector2) => {
    const ring_size = 5
    const rng = Array.from({length:ring_size}, (_,v)=>v-Math.floor(ring_size/2));
    const rng2 = [...rng, ...rng.toReversed().slice(1,-1)];
    return rng2
        .map((item, index)=>Vector2.add(position, {x:item, y:rng2[(index+rng2.length/4)%rng2.length]}))
        .filter(Vector2.in_bounds(world_size));
}
const cheat_kernel =function* (position:Vector2){
    const radius = 20;
    for(let x=-radius;x<=radius;x++){
        for(let y=-radius;y<=radius;y++){
            const dist = Math.abs(x)+Math.abs(y);
            const pos = Vector2.add(position, {x,y});
            if(dist>=2 && dist<=radius && in_bounds(pos)){
                yield [pos, dist] as [Vector2, number];
            }
        }
    }
}

draw_double_grid({
    size:world_size,
    char_positions:{
        "█":nodes.values().filter(n=>n.type===Tile.Wall).map(n=>n.pos).toArray(),
        //"&":result.path.map(n=>n.pos)
        //"*":cheat_spots(start_node!.pos)
    },
    //numbers: new Map(result.cost_g.entries().map(([hash, cost])=>[nodes.get(hash)!.pos, cost])),
    numbers: new Map(cheat_kernel({x:8,y:8}).filter(([pos,_])=>in_bounds(pos))),
    scale_x: 3,
    scale_y: 2,
});
const f = result.path
    .map(node=>({pos:node.pos, g_cost:result.cost_g.get(hash(node.pos))!}))
    .flatMap(({pos:start_pos, g_cost})=>cheat_kernel(start_pos)
        .map(([target_pos, cheat_cost])=>({
            start_pos,
            target_pos,
            cheat_cost:cheat_cost+g_cost,
            normal_cost:result.cost_g.get(hash(target_pos))
        }))
        .filter(({cheat_cost, normal_cost})=> normal_cost && cheat_cost<normal_cost)
        .map(f=>({...f, savings:f.normal_cost!-f.cheat_cost}))
        .filter(f=>f.savings>=50)
        .toArray()
    );
console.log(Map.groupBy(f,i=>i.savings))
const savings = new Map(
    Map.groupBy(f,i=>i.savings)
    .entries()
    .map(([k,v])=>[k,v.length])
    .filter(([saving, _])=>saving>=100)
)
console.log(savings)//.values().reduce((a,b)=>a+b))
console.log(savings.values().reduce((a,b)=>a+b))
