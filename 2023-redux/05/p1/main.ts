import { split_array } from "./split_array.ts";

const input = (
    await Deno.readTextFile("../input.txt")
).trim();

const lines = input.split("\n")

let [seeds_line, _, ...map_chunks] = lines;
let seeds = seeds_line.split(" ").slice(1).map(parseFloat);

let map_chunks_split = Array.from(split_array(map_chunks,i=>i===""))

let maps = map_chunks_split.map(
    item=>[
        item[0].split(/[- ]/).filter((_,i)=>!(i%2)),
        item.slice(1).map(item=>item.split(" ").map(parseFloat))
    ]
);

console.log(maps);



