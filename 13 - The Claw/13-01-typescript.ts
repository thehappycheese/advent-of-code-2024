import { Matrix2 } from "./Matrix2.ts";
import { Vector2 } from "./Vector2.ts";

// const input = `Button A: X+94, Y+34
// Button B: X+22, Y+67
// Prize: X=8400, Y=5400

// Button A: X+26, Y+66
// Button B: X+67, Y+21
// Prize: X=12748, Y=12176

// Button A: X+17, Y+86
// Button B: X+84, Y+37
// Prize: X=7870, Y=6450

// Button A: X+69, Y+23
// Button B: X+27, Y+71
// Prize: X=18641, Y=10279
// `

const input = await Deno.readTextFile("input.txt");

const parse_button = (prefix_length: number) => (input: string) => Vector2.from(
    input
        .split(/[:,] /)
        .slice(-2)
        .map(item => item.slice(prefix_length))
        .map(parseFloat) as [number, number]
);

const machines = input.trim().split("\n\n").map(
    chunk => chunk.split("\n")
).map(
    ([a, b, p]) => ({
        a: parse_button(1)(a),
        b: parse_button(1)(b),
        p: parse_button(2)(p),
    })
);

const score = (a:Vector2) => a.x*3+a.y;

let total = 0;
for (const machine of machines){
    // /console.log(machine);
    const m = Matrix2.hstack(machine.a, machine.b);
    if(Matrix2.determinant(m)===0){
        //console.log("Not Invertible")
        throw new Error(
            "Did not handle this case properly."+
            "May still be able to win if colinear with one of the buttons though?"
        )
    }
    const mip = Matrix2.apply_inverse(m, machine.p);
    if(Vector2.is_rounded(mip)){
        console.log("mip")
        Vector2.log(mip);
        console.log("mip2")
        Vector2.log(mip);
        const the_score = score(mip);
        console.log("score", the_score);
        total+=the_score;
    }
}
console.log(total);