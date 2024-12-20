import { shortest_path } from "./util/astar.ts";
import { Option } from "./util/Option.ts";
import { parse_input } from "./util/parse_input.ts";
import { lit, ParseResult, Parser } from './util/parser_combinator.ts';

// let input = `
// r, wr, b, g, bwu, rb, gb, br

// brwrr
// bggr
// gbbr
// rrbgbr
// ubwu
// bwurrg
// brgr
// bbrgwb
// `;
const input = await Deno.readTextFile("input.txt");
const {sources, patterns}  = parse_input(input)
console.log({sources, patterns})
console.log(sources.sort())


type Edge = {
    to:Node,
    cost:number,
    towel:string,
};
type Node = {
    offset:number,
    outbound:Edge[]
}
let parsers:[string, Parser][] = sources.map(s=>[s, lit(s)])

const range = (max:number) => Array.from({length:max},(_,i)=>i)

let found_pattern_count = 0;
for(const pattern of patterns){
    let nodes:Map<number, Node> = new Map(range(pattern.length+1).map(n=>[n,{
        offset:n,
        outbound:[]
    }]));
    for(let [towel, parser] of parsers){
        for(let offset=0; offset<pattern.length; offset++){
            Option.map(parser(pattern, offset), some=>{
                nodes.get(offset)!.outbound.push({to:nodes.get(offset+some.length)!, cost:1, towel})
            })
        }
    }
    // console.log(pattern);
    // console.log(nodes);
    try{
        let path = shortest_path({
            start:nodes.get(0)!,
            goal:nodes.get(pattern.length)!,
            adjacent:node=>node.outbound,
            heuristic: node=>pattern.length-node.offset,
            node_to_hash:node=>node.offset
        });
        console.log(`Found ${path.cost}`)
        found_pattern_count ++
    }catch(_){
        // not found
    }
}
console.log(`Found that ${found_pattern_count} of ${patterns.length} were possible`)