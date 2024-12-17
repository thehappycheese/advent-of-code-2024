


type Computer = {
    A:number
    B:number
    C:number
    program:number[]
    pointer:number
}

type Instruction = (stdout:(out:number)=>void)=>(c:Computer) => (
    ((cb:Combo) => Computer)| ((cb:Literal) => Computer)
)

type Combo = 0|1|2|3|4|5|6;
type Literal = number;

const combo = (c:Computer)=> (combo:Combo)=>{
    switch(combo){
        case 0:
        case 1:
        case 2:
        case 3:
            return combo
        case 4:
            return c.A
        case 5:
            return c.B
        case 6:
            return c.C
        default:
            throw new Error("Invalid combo")
    }
}

const adv:Instruction = (_stdout:(out:number)=>void)=>(cp:Computer)=>(cb:Combo)=>({
    ...cp,
    pointer:cp.pointer+2,
    A:Math.floor(
        cp.A / Math.pow(2,combo(cp)(cb))
    )
});

const bxl:Instruction = (_stdout:(out:number)=>void)=>(cp:Computer)=>(lit:number)=>({
    ...cp,
    pointer:cp.pointer+2,
    B:cp.B^lit
});

const bst:Instruction = (_stdout:(out:number)=>void)=>(cp:Computer)=>(cb:Combo)=>({
    ...cp,
    pointer:cp.pointer+2,
    B:combo(cp)(cb)&7
});

const jnz:Instruction = (_stdout:(out:number)=>void)=>(cp:Computer)=>(lit:number)=>({
    ...cp,
    pointer:cp.A===0?cp.pointer+2:cp.pointer=lit,
});

const bxc:Instruction = (_stdout:(out:number)=>void)=>(cp:Computer)=>(_:number)=>({
    ...cp,
    pointer:cp.pointer+2,
    B:cp.B^cp.C
});

const out:Instruction = (stdout:(out:number)=>void)=>(cp:Computer)=>(cb:Combo)=>{
    stdout(combo(cp)(cb)%8)
    return {
        ...cp,
        pointer:cp.pointer+2,
    }
};

const bdv:Instruction = (_stdout:(out:number)=>void)=>(cp:Computer)=>(cb:Combo)=>({
    ...cp,
    pointer:cp.pointer+2,
    B:Math.floor(
        cp.A / Math.pow(2,combo(cp)(cb))
    )
});

const cdv:Instruction = (_stdout:(out:number)=>void)=>(cp:Computer)=>(cb:Combo)=>({
    ...cp,
    pointer:cp.pointer+2,
    C:Math.floor(
        cp.A / Math.pow(2,combo(cp)(cb))
    )
});

const decode = (opcode:number) => [
    adv,bxl,bst,jnz,bxc,out,bdv,cdv
][opcode];

const step = (stdout:(out:number)=>void)=>(cp:Computer)=>{
    if (cp.pointer >= cp.program.length) throw new Error("eh");
    const opcode = cp.program[cp.pointer];
    const combo = cp.program[cp.pointer+1];
    const instruction = decode(opcode);
    //console.log(`>>> ${opcode}:${instruction.name} ${combo}`);
    return instruction(stdout)(cp)(combo as any)
}
const print_state = (cp:Computer)=>{
    console.log(`>>> ABC:  ${cp.A} ${cp.B} ${cp.C}  `)
    console.log(`>>> PROG: ${cp.program}`);
    console.log(`>>> P: ${
            cp.pointer.toFixed(0).padStart(2)
        } ${
            Array.from({length:cp.pointer*2}).fill("-").join("")
        }^ ^`
    )

}
const run = (stdout:(out:number)=>void)=>(cp:Computer)=>{
    let state = cp;
    //print_state(state)
    while(state.pointer<state.program.length){
        //console.log("---")
        state = step(stdout)(state)
        //print_state(state)
    }
    return state
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

function solve(input:string){
    const computer = parse_input(input);
    //console.log("initial",  computer)
    const stdout:number[] = []
    const final_state = run(i=>stdout.push(i))(computer)
    console.log("Output: ", stdout.join(","))
}
// solve(`
// Register A: 729
// Register B: 0
// Register C: 0

// Program: 0,1,5,4,3,0
// `)
solve(await Deno.readTextFile("input.txt"))