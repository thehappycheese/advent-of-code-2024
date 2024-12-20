import { Computer, decompile, print_state, run_to_list, run_generate } from "./util/computer.ts";

const parse_input = (input:string):Computer=>{
    const [reg, prog] = input.trim().split("\n\n")
    const [A,B,C] = reg.split("\n").map(i=>i.split(": ")[1]).map(parseFloat);
    const program = prog.split(": ")[1].split(",").map(parseFloat)
    return {
        A,
        B,
        C,
        program,
        pointer:0
    }
}



let input;
try{
    input = await Deno.readTextFile("input.txt");
}catch(e){
    input = await Deno.readTextFile("./17 - Computer/input.txt");
}
// const input = `
// Register A: 2024
// Register B: 0
// Register C: 0

// Program: 0,3,5,4,3,0
// `;
const computer = parse_input(input);
print_state(computer);
console.log(decompile(computer));

// manually compile into js
// function quick_run(A:number){
//     const out = [];
//     while(A>0){
//         let b = (A & 7) ^ 1;
//         out.push(((b ^ Math.floor(A / (2**b))) ^ 6) & 7);
//         A = Math.floor(A/8);
//     }
//     return out
// }


console.log("=== Run Forwards: ====")
console.log("run_to_list  ", run_to_list(computer).join(","));
//console.log("quick_run    ", quick_run(computer.A).join(","));
console.log("run_generate ", run_generate(computer).toArray().join(","))

console.log("\n=== Run Backwards: ===")


type Stage = {
    expected:number,
    output?: number,
    values_tried:number[],
}

let stages:Stage[] = computer
    .program
    .toReversed()
    .map(expected=>({expected, output:undefined,  values_tried:[0]}));
stages[0].values_tried = [7]
const stages_to_base = (stages:Stage[]) => stages
    .map(i=>i.values_tried.at(-1)!)
    .reduce((base, i)=>base*8+i);
const update_output = (stages:Stage[], computer:Computer)=>{
    const A = stages_to_base(stages);
    const actual_result = run_to_list({...computer, A}).toReversed();
    //const actual_result = quick_run(A).toReversed();
    return stages.map((stage,i)=>({...stage, output:actual_result[i]}));
}

let limit = 500
while(limit>0){
    limit--;
    // Update output
    stages = update_output(stages, computer);
    // Loop forward through stages until mismatch is found, increment until correct.
    //console.log("---")
    let need_to_try_again = false;
    for(let stage of stages){
        //console.log(stage)
        if(stage.expected!==stage.output){
            stage.values_tried = [...stage.values_tried, stage.values_tried.at(-1)!+1]
            need_to_try_again = true
            break
        }
    }
    if(!need_to_try_again){
        console.log("COMPLETED SEARCH SUCCESSFULLY")
        break
    }
}
console.log(stages)//.map(s=>({...s, values_tried:s.values_tried.at(-1)})))
console.log("DONE!", stages_to_base(stages));
console.log(run_to_list({...computer, A:stages_to_base(stages)}).join(",")) // for some reason this doesn't work :(
//console.log(quick_run(stages_to_base(stages)).join(","))



















// const target = computer.program.toReversed();
// let tp=0;
// let base = 0;
// const all_possibles:number[][] = [];
// while(stages.length<target.length){
//     const expected_result = target[tp]
//     let not_found = true;
//     const possibles:number[] = [];
//     all_possibles.push(possibles);
//     for(let i=0; i<150; i++){
//         const full_output = run_to_list({...computer,A:base+i});
//         const actual_result = full_output.at(-(tp+1));
//         if(actual_result === expected_result){
//             not_found = false;
//             possibles.push(i)
//             stages.push(i);
//             tp++
//             bases.push(base+i);
//             base =    (base+i)*8;
//             break
//         }
//     }
//     if(not_found){
//         console.log("fail")
//         break
//     }
// }
// console.log("all_possibles:", all_possibles)



















// base = Math.floor(base/8);
// console.log("stages", stages.join(","));
// console.log("bases", bases.join(","));
// console.log("Check Quick", quick_run(base).join(","));
// console.log("Check", run_to_list({...computer, A:base}).join(","));
// console.log("Answer:", base);

// console.log("...");

// bases
// .map(A=>[A,run_to_list({...computer, A:A})])
// //.map(s=>[s,quick_run(s)])
// .forEach(([a,b])=>console.log(a.toString().padStart(30),b.join(",").padStart(38)))

// let stages2 = [7,0,2,6,4,2,4,5,2,8,0,0,0,0,0,0];
// let base2 = stages2.reduce((acc, curr)=>(acc*8+curr));
// let pd = (i:number)=>i.toString().padStart(2);
// console.log("targ:   ", target.map(pd).join(","))
// console.log("piccky: ", run_to_list({...computer, A:base2}).toReversed().map(pd).join(","))