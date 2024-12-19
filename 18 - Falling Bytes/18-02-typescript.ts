import { Vector2 } from "./util/Vector2.ts";
import { shortest_path } from "./util/astar.ts";

let input = await Deno.readTextFile("input.txt");
let world_size:Vector2 = {x:71, y:71};
let goal:Vector2 = {x:70,y:70};
let initial_size = 1025;

// let input = `
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
// let initial_size = 12;

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


const draw_grid = (
    size: Vector2, 
    char_positions: Record<string, Vector2[]>, 
    background_char: string = "░"
) => {
    const grid = Array.from({ length: size.y }, () => Array(size.x).fill(background_char));
    Object.entries(char_positions).forEach(([char, positions]) => {
        positions.forEach(({x, y}) => {
            if (x < size.x && y < size.y) grid[y][x] = char;
        });
    });
    grid.forEach(row => console.log(row.join("")));
};


const banned_positions = parse_input(input).map(([x,y])=>({x,y}));
const banned_positions_hashed = banned_positions.map(hash_vec(world_size))
console.log(banned_positions);
const banned_position_map = new Map(banned_positions.map(pos=>[hash_vec(world_size)(pos), pos]).slice(0, initial_size));
console.log("there are ", banned_position_map.size, "banned positions");

const hash_vec_world = hash_vec(world_size);
for(let i = initial_size; i<banned_positions.length; i++){
    console.log(i)
    const fall_pos = banned_positions[i];
    banned_position_map.set(hash_vec_world(fall_pos), fall_pos);
    try{
        const {path} = shortest_path({
            start:{x:0, y:0},
            goal,
            heuristic:pos=>Math.abs(goal.x-pos.x)+Math.abs(goal.y-pos.y),
            node_to_hash:hash_vec(world_size),
            adjacent:pos=>index_neighbors(world_size)(pos).filter(
                pos=> !banned_position_map.has(hash_vec(world_size)(pos.to))
            ),
        });
    }catch(e){
        console.log("blocked", i, fall_pos);
        banned_position_map.delete(hash_vec_world(fall_pos))
        const {path} = shortest_path({
            start:{x:0, y:0},
            goal,
            heuristic:pos=>Math.abs(goal.x-pos.x)+Math.abs(goal.y-pos.y),
            node_to_hash:hash_vec(world_size),
            adjacent:pos=>index_neighbors(world_size)(pos).filter(
                pos=> !banned_position_map.has(hash_vec(world_size)(pos.to))
            ),
        });
        draw_grid(world_size,{"█":banned_positions,"x":path, "%":[fall_pos]});
        break
    }
}


// draw_grid(world_size,{"█":banned_positions,"x":path});
// console.log("Test Case Correct steps:", path.length-1);