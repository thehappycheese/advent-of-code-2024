import { Computer, run, decompile, run_until_mismatch, print_state, run_to_console, run_to_list, run_generate } from "./util/computer.ts";

const quickstep = (stdout:(out:number)=>void)=>(cp:Computer)=>{
    if (cp.pointer >= cp.program.length) throw new Error("eh");
    // const opcode = cp.program[cp.pointer];
    // const combo = cp.program[cp.pointer+1];
    // const instruction = decode(opcode);
    //console.log(`>>> ${opcode}:${instruction.name} ${combo}`);
    let a = cp.A;
    let b = (a & 7) ^ 1;
    const out = ((b ^ Math.floor(a / (2**b))) ^ 6) & 7;
    stdout(out);
    const A = Math.floor(cp.A/8);
    return {...cp, A}
}


const search = (initial_computer:Computer)=>{
    for(let A=0; A<4e9; A++){
        let state = {...initial_computer, A};
        if(A%10_000_000==0) console.log(A);
        let output_pointer = 0;
        const stdout:number[] = [];
        //console.log("---")
        //console.log("A:", A,"Target state: ", initial_computer.program)
        while(state.pointer < state.program.length){
            let mismatch = false;
            let done= false
            
            state = quickstep(out=>{
            //state = step(out=>{
                stdout.push(out);
                //console.log("out: ",out);
                const expected = initial_computer.program[output_pointer];
                output_pointer++;
                if(out!==expected){
                    mismatch = true
                    // if(stdout.length>4){
                    //     console.log(`Failed attempt ${A} ${stdout.join(",")}`)
                    // }
                }else if(output_pointer==initial_computer.program.length){
                    done = true
                    //console.log("--- done? A:",A, "output_pointer",output_pointer)
                }
            })(state);
            if (done) return {...initial_computer, A}
            if(mismatch) break;
        }
    }
    throw new Error("exceeded attempt limit")
}
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

function quick_run(A:number){
    const out = [];
    while(A>0){
        let b = (A & 7) ^ 1;
        out.push(((b ^ Math.floor(A / (2**b))) ^ 6) & 7);
        A = Math.floor(A/8);
    }
    return out
}
function quick_step(A:number){
    let b = (A & 7) ^ 1;
    return ((b ^ Math.floor(A / (2**b))) ^ 6) & 7;
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
console.log("=== Run Forwards: ====")
console.log("run_to_list  ", run_to_list(computer).join(","));
console.log("quick_run    ", quick_run(computer.A).join(","));
console.log("run_generate ", run_generate(computer).toArray().join(","))
console.log("run gen next ", run_generate(computer).next().value)
console.log("\n=== Run Backwards: ===")
let target = computer.program.toReversed();
let tp=0;
let stages:number[] = [];
let bases = []
let base = 0;
while(stages.length<target.length){
    const expected_result = target[tp]
    for(let i=0; i<100; i++){
        const actual_result = run_generate({...computer, A:base+i}).next().value!;
        if(actual_result === expected_result){
        //if(quick_step(base+i) === expected_result){
            stages.push(i);
            tp++
            bases.push(base+i);
            base = (base+i)*8;
            break
        }
    }
}
base = Math.floor(base/8);
console.log("stages", stages.join(","));
console.log("bases", bases.join(","));
console.log("Check Quick", quick_run(base).join(","));
console.log("Check", run_to_list({...computer, A:base}).join(","));
console.log("Answer:", base);

console.log("...");

bases
.map(A=>[A,run_to_list({...computer, A:A})])
//.map(s=>[s,quick_run(s)])
.forEach(([a,b])=>console.log(a.toString().padStart(30),b.join(",").padStart(38)))

let stages2 = [7,0,2,6,4,2,4,5,2,8,0,0,0,0,0,0];
let base2 = stages2.reduce((acc, curr)=>(acc*8+curr));
let pd = (i:number)=>i.toString().padStart(2);
console.log("targ:   ", target.map(pd).join(","))
console.log("piccky: ", run_to_list({...computer, A:base2}).toReversed().map(pd).join(","))