import { Computer, run, decompile, run_until_mismatch, print_state, run_to_console, run_to_list } from "./util/computer.ts";

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
function quick_search(){
    const target = [2,4,1,1,7,5,4,0,0,3,1,6,5,5,3,0]
    console.log("Quick")
    for(let initial_A=3e9; initial_A<Number.MAX_SAFE_INTEGER;initial_A++){
        if(initial_A%1e9==0) console.log(initial_A);
        let pointer = 0;
        let A = initial_A;
        while(A>0 && pointer<target.length){
            const expected = target[pointer];
            pointer++;
            const b = (A & 7) ^ 1;
            const actual = (((b ^ Math.floor(A / (2**b))) ^ 6) & 7)
            if(expected!=actual) break;
            A = Math.floor(A/8);
        }
        if(pointer>10) console.log("pointer",pointer,"A", initial_A);
        if (A===0 && pointer===target.length+1) return A;
    }
    console.log("Search")
}



const input = await Deno.readTextFile("input.txt");
// const input = `
// Register A: 2024
// Register B: 0
// Register C: 0

// Program: 0,3,5,4,3,0
// `;
const computer = parse_input(input);
print_state(computer);
console.log(decompile(computer));
console.log("Output", run_to_list(computer).join(","));
console.log("Output Quick", quick_run(computer.A).join(","));


console.log("...")
let n = (((56*8+2)*8+6)*8+4)*8+2
console.log(quick_run(n))
console.log(quick_step(n))
console.log("...")

let target = computer.program.reverse()
let tp=0;
let stages:number[] = []
let pin = 0;
while(stages.length<target.length){
    const expected_result = target[tp]
    const base = 0;
    for(let stage of stages){
        base = base*8+stage;
    }
    for(let pin=0;pin<8;pin++){
        quick_step()
    }
}

//console.log(run_until_mismatch(computer.program)({...computer, A:3933903034}))