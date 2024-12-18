import { Vector2 } from "./util/Vector2.ts";
import { shortest_path } from "./util/astar.ts";

//let input = await Deno.readTextFile("input.txt");

let input_test = `
5,4
4,2
4,5
3,0
2,1
6,3
2,4
1,5
0,6
3,3
2,6
5,1
1,2
5,5
2,5
6,5
1,4
0,4
6,4
1,1
6,1
1,0
0,5
1,6
2,0
`;
type Node = {
    pos:Vector2,
    outbound:{to:Node, cost:1}
}
const hash_vec = (world_size:Vector2) => (pos:Vector2)=> pos.x + pos.y * (world_size.x+1);
const build_network = (world_size:Vector2, banned_positions:Vector2)=>{
    let nodes = new Map<number, Node>()
    for(let x o])
}
const parse_input = (input:string) => input.trim().split("\n").map(i=>i.split(",").map(parseFloat));
const index_neighbors = (world_size:Vector2) => (position:Vector2) => [
    {to:{x:position.x-1, y:position.y}, cost:1},
    {to:{x:position.x+1, y:position.y}, cost:1},
    {to:{x:position.x, y:position.y-1}, cost:1},
    {to:{x:position.x, y:position.y+1}, cost:1},
].filter(
    ({to:{x,y}}) => x >= 0 && x < world_size.x && y >= 0 && y < world_size.y
);
let world_size:Vector2 = {x:7, y:7};
let start:Vector2 = {x:0, y:0};
let goal:Vector2 = {x:6,y:6};
const {cost,path} = shortest_path({
    start,
    goal,
    heuristic:pos=>Math.abs(goal.x-pos.x)+Math.abs(goal.y-pos.y),
    node_to_hash:,
    adjacent:index_neighbors(world_size),
});
console.log(path);