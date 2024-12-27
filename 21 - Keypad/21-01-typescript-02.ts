import { create_keypad_sequence, draw_network, hash_node, key_positions_arrow, key_positions_door, Key} from "./network.ts";
import { shortest_path } from "./util/astar.ts";

const input = `
029A
980A
179A
456A
379A
`;
const expected_out = `
029A: <vA<AA>>^AvAA<^A>A<v<A>>^AvA^A<vA>^A<v<A>^A>AAvA^A<v<A>A>^AAAvA<^A>A
980A: <v<A>>^AAAvA^A<vA<AA>>^AvAA<^A>A<v<A>A>^AAAvA<^A>A<vA>^A<A>A
179A: <v<A>>^A<vA<A>>^AAvAA<^A>A<v<A>>^AAvA^A<vA>^AA<A>A<v<A>A>^AAAvA<^A>A
456A: <v<A>>^AA<vA<A>>^AAvAA<^A>A<vA>^A<A>A<vA>^A<A>A<v<A>A>^AAvA<^A>A
379A: <v<A>>^AvA^A<vA<AA>>^AAvA<^A>AAvA^A<vA>^AA<A>A<v<A>A>^AAAvA<^A>A
`;
const input_codes = input.trim().split("\n");
const output_codes = expected_out.trim().split("\n").map(i=>i.split(" ")[1].trim())


let solve = (key_positions:Map<Key, Vector2>)=>(keys:string[])=>{
    let {nodes, start_node, end_node} = create_keypad_sequence(key_positions)(keys as Key[]);
    let result = shortest_path({
    
        start:start_node,
        goal:end_node,
        adjacent:n=>n.outbound,
        heuristic:n=>Math.abs(n.pos.x-end_node.pos.x)+Math.abs(n.pos.y-end_node.pos.y)+Math.abs(n.layer-end_node.layer),
        node_to_hash:hash_node
    })
    const keep_set = new Set([">","<","^","v","A"])
    return result.path.flatMap(({next})=>next?[next.type]:[]).filter(n=>keep_set.has(n));
}

let door = (keys:string[])=>solve(key_positions_door)(keys as Key[])
let arrows = (keys:string[])=>solve(key_positions_arrow)(keys as Key[])

let system = (keys:string[])=>arrows(arrows(door(keys))).join("")

let result = input_codes.map(i=>system(i.split("")))
console.log(result)
// console.log(input_codes.map(i=>arrows(door(i.split("")))))
// console.log(input_codes.map(i=>arrows(arrows(door(i.split(""))))))
console.log(result.map(i=>i.length))
console.log(output_codes.map(i=>i.length))
draw_network(create_keypad_sequence(key_positions_arrow)("><^A".split("") as Key[]))()