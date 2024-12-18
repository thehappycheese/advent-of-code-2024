import { Vector2 } from "./util/Vector2.ts";
import { shortest_path } from "./util/astar.ts";

let input = await Deno.readTextFile("input.txt");
let world_size:Vector2 = {x:70, y:70};
let goal:Vector2 = {x:69,y:69};
// let input_test = `
// 5,4
// 4,2
// 4,5
// 3,0
// 2,1
// 6,3
// 2,4
// 1,5
// 0,6
// 3,3
// 2,6
// 5,1
// 1,2
// 5,5
// 2,5
// 6,5
// 1,4
// 0,4
// 6,4
// 1,1
// 6,1
// 1,0
// 0,5
// 1,6
// 2,0
// `;
// let world_size:Vector2 = {x:7, y:7};
// let goal:Vector2 = {x:6,y:6};
type Node = {
    pos:Vector2,
    outbound:{to:Node, cost:1}
}
const hash_vec = (world_size:Vector2) => (pos:Vector2)=> pos.x + pos.y * (world_size.x+1);
// const build_network = (world_size:Vector2, banned_positions:Vector2)=>{
//     let nodes = new Map<number, Node>()
//     for(let x o])
// }
const parse_input = (input:string) => input.trim().split("\n").map(i=>i.split(",").map(parseFloat));
const index_neighbors = (world_size:Vector2) => (position:Vector2) => [
    {to:{x:position.x-1, y:position.y}, cost:1},
    {to:{x:position.x+1, y:position.y}, cost:1},
    {to:{x:position.x, y:position.y-1}, cost:1},
    {to:{x:position.x, y:position.y+1}, cost:1},
].filter(
    ({to:{x,y}}) => x >= 0 && x < world_size.x && y >= 0 && y < world_size.y
);
const banned_positions = parse_input(input).map(([x,y])=>({x,y})).slice(0,1024);
const banned_position_set = new Set(banned_positions.map(pos=>hash_vec(world_size)(pos)));
console.log("there are ", banned_positions.length, "banned positions");
const draw_grid = (size:Vector2, positions:Vector2[]) => {
    const grid = Array.from({ length: size.y }, () => Array(size.x).fill("."));
    positions.forEach(({x, y}) => { if (x < size.x && y < size.y) grid[y][x] = "#"; });
    grid.forEach(row => console.log(row.join("")));
};
draw_grid(world_size,banned_positions);
const {cost,path} = shortest_path({
    start:{x:0, y:0},
    goal,
    heuristic:pos=>Math.abs(goal.x-pos.x)+Math.abs(goal.y-pos.y),
    node_to_hash:hash_vec(world_size),
    adjacent:pos=>index_neighbors(world_size)(pos).filter(pos=> !banned_position_set.has(hash_vec(world_size)(pos.to))),
});
console.log(path);
console.log(path.length);