import { Vector2 } from "./Vector2.ts";

const print = async (str: string) => {
    const bytes = new TextEncoder().encode(str);
    await Deno.stdout.write(bytes);
}
function display(width:number, height:number, walls:Vector2[], robot:Vector2, boxes:Vector2[]){
    const output = []
    for(let row=0;row<height;row++){
        const out_row:string[] = [];
        output.push(out_row);
        for(let col =0;col<width;col++){
            out_row.push("⬛")
        }
    }
    for(const wall of walls){
        output[wall.y][wall.x] = "🧱"
    }
    for(const box of boxes){
        output[box.y][box.x] = "📦"
    }
    output[robot.y][robot.x]="🤖";
    return output.map(item=>item.join("")).join("\n")
}
async function erase(lines:number){
    for (let i = 0; i < lines; i++) {
        await print("\x1b[F\x1b[K")
    }
}

// const input = `########
// #..O.O.#
// ##@.O..#
// #...O..#
// #.#.O..#
// #...O..#
// #......#
// ########

// <^^>>>vv<v>>v<<
// `;
// const input = `##########
// #..O..O.O#
// #......O.#
// #.OO..O.O#
// #..O@..O.#
// #O#..O...#
// #O..O..O.#
// #.OO.O.OO#
// #....O...#
// ##########

// <vv>^<v^>v>^vv^v>v<>v^v<v<^vv<<<^><<><>>v<vvv<>^v^>^<<<><<v<<<v^vv^v>^
// vvv<<^>^v^^><<>>><>^<<><^vv^^<>vvv<>><^^v>^>vv<>v<<<<v<^v>^<^^>>>^<v<v
// ><>vv>v^v^<>><>>>><^^>vv>v<^^^>>v^v^<^^>v^^>v^<^v>v<>>v^v^<v>v^^<^^vv<
// <<v<^>>^^^^>>>v^<>vvv^><v<<<>^^^vv^<vvv>^>v<^^^^v<>^>vvvv><>>v^<<^^^^^
// ^><^><>>><>^^<<^^v>>><^<v>^<vv>>v>>>^v><>^v><<<<v>>v<v<v>vvv>^<><<>^><
// ^>><>^v<><^vvv<^^<><v<<<<<><^v<<<><<<^^<v<^^^><^>>^<v^><<<^>>^v<v^v<v^
// >^>>^v>vv>^<<^v<>><<><<v<<v><>v<^vv<<<>^^v^>^^>>><<^v>>v^v><^^>>^<>vv^
// <><^^>^^^<><vvvvv^v<v<<>^v<v>v<<^><<><<><<<^^<<<^<<>><<><^^^>^^<>^>v<>
// ^^>vv<^v^v<vv>^<><v<^v>^^^>>>^^vvv^>vvv<>>>^<^>>>>>^<<^v>^vvv<>^<><<v>
// v^^>>><<^^<>>^v^<v^vv<>v^<<>^<^v^v><^<<<><<^<v><v<>vv>>v><v^<vv<>v^<<^
// `
const input = await Deno.readTextFile("input.txt");
const encode_move = (m:Vector2)=>{
    if(m.x===0){
        if(m.y<0){
            return "^"
        }else{
            return "v"
        }
    }else{
        if (m.x<0){
            return "<"
        }else{
            return ">"
        }
    }
}
let [room_txt, moves_txt] = input.trim().split("\n\n");
const moves:Vector2[] = moves_txt.replaceAll("\n", "").split("").map(direction => {
    switch (direction) {
        case ">":
            return { x: 1, y: 0 };
        case "<":
            return { x: -1, y: 0 };
        case "^":
            return { x: 0, y: -1 };
        case "v":
            return { x: 0, y: 1 };
        default:
            throw Error("Failed to parse");
    }
});
type Item = {
    type:"wall"|"robot"|"box"
    pos:Vector2,
}
const tiles = room_txt.split("\n").map(row_text=>row_text.split(""));
const room:Item[] = room_txt.split("\n").flatMap((row_text, y)=>row_text.split("").flatMap((cell, x)=>{
    switch(cell){
        case "#":
            return [{type:"wall", pos:{y, x}}];
        case "O":
            return [{type:"box", pos:{y, x}}];
        case "@":
            return [{type:"robot", pos:{y, x}}];
        default:
            return []
    }
}))
const walls = room.filter(item=>item.type=="wall");
const bot = room.find(item=>item.type==="robot")!;
const boxes = room.filter(item=>item.type=="box");

const hash_positions = (items:Item[]) => new Map(items.map(item=>[Vector2.hash(item.pos), item.pos]));

let current_bot_position:Vector2 = bot.pos;
let box_positions = hash_positions(boxes);
const wall_positions = hash_positions(walls);
console.log(display(
    tiles[0].length,
    tiles.length,
    Array.from(wall_positions.values()),
    current_bot_position,
    Array.from(box_positions.values())
))
let move_history = [];
let box_load_history = [];
for(const move of moves){
    let next_robot_position = Vector2.add(current_bot_position, move);
    let next_robot_hash = Vector2.hash(next_robot_position);
    if(wall_positions.has(next_robot_hash)){
        // 
    }else if(box_positions.has(next_robot_hash)){
        let box_load = 1;
        let next_affected_position = Vector2.add(next_robot_position, move);
        const in_bounds = (v:Vector2)=>v.x>=0 && v.y>=0 && v.y<tiles.length && v.x<tiles[0].length;
        while(in_bounds(next_affected_position)){
            let nap_hash = Vector2.hash(next_affected_position);
            if(wall_positions.has(nap_hash)){
                break
            }if(box_positions.has(nap_hash)){
                box_load+=1
            }else{
                box_load_history.push(box_load);
                current_bot_position = next_robot_position;
                box_positions.delete(next_robot_hash);
                box_positions.set(
                    nap_hash,
                    next_affected_position
                )
                break
            }
            next_affected_position = Vector2.add(next_affected_position, move)
        }
    }else{
        current_bot_position = next_robot_position;
    }
    // await erase(tiles.length+2);
    
    // move_history.push(encode_move(move))
    // console.log(`Move: ${move_history.slice(-5).join("")}`)
    // console.log(`Box Load: ${box_load_history.slice(-5).join(",")}`)
    // console.log(display(
    //     tiles[0].length,
    //     tiles.length,
    //     Array.from(wall_positions.values()),
    //     current_bot_position,
    //     Array.from(box_positions.values())
    // ))
    // await new Promise(resolve=>setTimeout(resolve, 1000));
}
const GPS = (v:Vector2) => 100*v.y+v.x;
console.log(box_positions.values().map(GPS).reduce((a,b)=>a+b))