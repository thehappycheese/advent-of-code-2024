import { parse_float, join, collect, repeat, digit, reduce, ParseResult, pick, sequence, lit, reduce_init, find_all, Option } from "./shared.ts";

//const input = "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))";
const input = await Deno.readTextFile("../input.txt");

let num = parse_float(join("")(collect(repeat(digit, 1, 3))));
let multiply_expression = reduce((a,b)=>ParseResult.get(a)*ParseResult.get(b))(pick([1,3])(sequence([lit("mul("),num,lit(","),num, lit(")")])))

let parser = reduce_init((a,b)=>a+ParseResult.get(b),0)(find_all(multiply_expression))

console.log(
    Option.map(parser(input,0),ParseResult.get)
)