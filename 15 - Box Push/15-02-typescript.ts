import chalk from 'chalk';
import { Vector2 } from "./Vector2.ts";
import { Option } from "./Option.ts";
import { TerminalRenderer } from "./TerminalRenderer.ts";

const print = async (str: string) => {
    const bytes = new TextEncoder().encode(str);
    await Deno.stdout.write(bytes);
}
function display(world_size:Vector2, walls:Vector2[], robot:Vector2, boxes:Vector2[]){
    const output = []
    for(let row=0;row<world_size.y;row++){
        const out_row:string[] = [];
        output.push(out_row);
        for(let col =0;col<world_size.x;col++){
            out_row.push(" ")
        }
    }
    for(const wall of walls){
        output[wall.y][wall.x] = chalk.bgRgb(181,55,49).rgb(250,225, 185)("#")
    }
    for(const box of boxes){
        output[box.y][box.x]   = chalk.bgRgb(203,161,117).rgb(132,103,73)("[")
        output[box.y][box.x+1] = chalk.bgRgb(203,161,117).rgb(132,103,73)("]")
    }
    output[robot.y][robot.x]="@";
    return output.map(item=>item.join("")).join("\n")
}


function prepare_buffers(
    world_size:Vector2,
    walls: Vector2[],
    robot: Vector2,
    boxes: Vector2[],
): string[][] {

    const styledBuffer = Array.from({ length: world_size.y }, () => Array(world_size.x).fill(" "));

    for (const wall of walls) {
        styledBuffer[wall.y][wall.x] = chalk.bgRgb(181, 55, 49).rgb(250, 225, 185)("#");
    }

    for (const box of boxes) {
        styledBuffer[box.y][box.x] = chalk.bgRgb(203, 161, 117).rgb(132, 103, 73)("[");
        styledBuffer[box.y][box.x + 1] = chalk.bgRgb(203, 161, 117).rgb(132, 103, 73)("]");
    }

    styledBuffer[robot.y][robot.x] = chalk.yellow("@");

    return styledBuffer;
}



async function erase(lines:number){
    for (let i = 0; i < lines; i++) {
        await print("\x1b[F\x1b[K")
    }
}
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
};
const decode_move = (direction:string) => {
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
};
const GPS = (v:Vector2) => 100*v.y+v.x;
type WorldItem = {
    type:"wall"|"robot"|"box"
    pos:Vector2,
}
const hash_positions = (items:WorldItem[]) => new Map(items.map(item=>[Vector2.hash(item.pos), item.pos]));
const in_world_bounds = (v:Vector2, world_size:Vector2)=>v.x>=0 && v.y>=0 && v.y<world_size.y && v.x<world_size.x;
const shape_in_world_bounds = (shape:Vector2[], world_size:Vector2)=>shape.every(shape=>in_world_bounds(shape, world_size));


const collide = (
    shape:Vector2[],
    move:Vector2,
    box_positions:Map<string, Vector2>,
    wall_positions:Map<string, Vector2>,
    world_size:Vector2,
    except_box:string|null = null
):Option<[string, Vector2][]> => {
    const next_shape_position = shape.map(shape_part=>Vector2.add(shape_part, move));
    const BOX_SIDE = {x:1, y:0};
    //console.log(`Colliding shape ${shape.map(Vector2.hash).join("~~")} moving to ${next_shape_position.map(Vector2.hash).join("~~")}`)
    if(shape_in_world_bounds(next_shape_position,world_size)){
        if(next_shape_position.some(shape_part=>wall_positions.has(Vector2.hash(shape_part)))){
            //console.log("hit wall");
            return Option.None()
        }
        return Option.flatMap(
            box_positions.entries().filter(([hash, pos])=>
                   hash!==except_box 
                && next_shape_position.some(
                    shape_part=>
                        Vector2.eq(shape_part, pos)
                        || Vector2.eq(shape_part, Vector2.add(pos, BOX_SIDE))
                )
            ),
            ([hash, box_position])=> {
                //console.log(`Hit Box ${hash}`)
                return Option.map(
                collide(
                    [box_position, Vector2.add(box_position, BOX_SIDE)],
                    move,
                    box_positions,
                    wall_positions,
                    world_size,
                    hash
                ),
                item=>[[hash, box_position], ...item]
            )}
        );
    }else{
        // out of bounds
        //console.log("Out of bounds")
        return Option.None();
    }
}

async function solve(input:string){

    

    const [room_txt, moves_txt] = input.trim().split("\n\n");
    const moves:Vector2[] = moves_txt.replaceAll("\n", "").split("").map(decode_move);
    const tiles = room_txt.split("\n").map(row_text=>row_text.split(""));
    const room:WorldItem[] = room_txt.split("\n").flatMap((row_text, y)=>row_text.split("").flatMap((cell, x)=>{
        switch(cell){
            case "#":
                return [{type:"wall", pos:{y, x:x*2}},{type:"wall", pos:{y, x:x*2+1}}] as WorldItem[];
            case "O":
                return [{type:"box", pos:{y, x:x*2}}];
            case "@":
                return [{type:"robot", pos:{y, x:x*2}}];
            default:
                return []
        }
    }))
    const walls = room.filter(item=>item.type=="wall");
    const bot = room.find(item=>item.type==="robot")!;
    const boxes = room.filter(item=>item.type=="box");
    const world_size = {x:tiles[0].length*2, y:tiles.length};
    const box_positions = hash_positions(boxes);
    const wall_positions = hash_positions(walls);

    let current_bot_position:Vector2 = bot.pos;
    //const move_history = [];

    const render = new TerminalRenderer(
        world_size
    )
    await new Promise(resolve=>setTimeout(resolve,1000));
    await render.clear();
    
    await render.render_initial(prepare_buffers(
        world_size,
        Array.from(wall_positions.values()),
        current_bot_position,
        Array.from(box_positions.values())
    ));

    // console.log(display(
    //     world_size,
    //     Array.from(wall_positions.values()),
    //     current_bot_position,
    //     Array.from(box_positions.values())
    // ));
    for(const move of moves){
        const next_robot_position = Vector2.add(current_bot_position, move);
        Option.map(
            collide(
                [current_bot_position],
                move,
                box_positions,
                wall_positions,
                world_size
            ),
            affected_boxes=>{
                affected_boxes.forEach(([hash,_pos])=>box_positions.delete(hash))
                affected_boxes.forEach(([_hash,pos])=>{
                    const new_box_position = Vector2.add(pos, move);
                    box_positions.set(
                        Vector2.hash(new_box_position),
                        new_box_position
                    )
                })
                current_bot_position = next_robot_position;
            }
        )
        await render.render(prepare_buffers(
            world_size,
            Array.from(wall_positions.values()),
            current_bot_position,
            Array.from(box_positions.values())
        ));

        // await print("\x1b[H\x1b[J");s
        // move_history.push(encode_move(move))
        // console.log(`Move: ${move_history.slice(-5).join("")}`)
        // console.log(display(
        //     world_size,
        //     Array.from(wall_positions.values()),
        //     current_bot_position,
        //     Array.from(box_positions.values())
        // ))
        // await new Promise(resolve=>setTimeout(resolve, 1));
    }
    
    const result = box_positions.values().map(GPS).reduce((a,b)=>a+b)
    return result
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
// const input = `#######
// #...#.#
// #.....#
// #..OO@#
// #..O..#
// #.....#
// #######

// <vv<<^^<<^^
// `
//const input = await Deno.readTextFile("./15 - Box Push/input.txt");
const input = await Deno.readTextFile("input.txt");
console.log(await solve(input))