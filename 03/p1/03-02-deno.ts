import { parse_float, join, collect, repeat, digit, reduce, ParseResult, pick, sequence, lit, reduce_init, find_all, Option, alternation } from "./shared.ts";

//const input = "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))";
const input = await Deno.readTextFile("../input.txt");

let num = parse_float(join("")(collect(repeat(digit, 1, 3))));
let multiply_expression = reduce((a,b)=>ParseResult.get(a)*ParseResult.get(b))(pick([1,3])(sequence([lit("mul("),num,lit(","),num, lit(")")])));
const _do = lit("do()");
const dont = lit("don't()");

let parser = find_all(alternation([multiply_expression, dont, _do]))

let sum = 0;
let enabled = true;
for(let instruciton of Option.unwrap(Option.map(parser(input,0),ParseResult.get)).map(ParseResult.get)) {
    if(instruciton==="don't()"){
        enabled = false;
    }else if(instruciton==="do()"){
        enabled=true;
    }else{
        if(enabled){
            sum+=instruciton
        }
    }
}
console.log(sum)