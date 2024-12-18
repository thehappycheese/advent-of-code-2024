


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
const describe_combo = (cb:Combo)=>({
        0:"0",
        1:"1",
        2:"2",
        3:"3",
        4:"A",
        5:"B",
        6:"C",
    }[cb])
const describe = (offset:number) => (opcode:number) => (cb:Combo)=> {
    const dcb = describe_combo(cb);
    const lit = cb;
    return {
        0 : `${offset.toFixed().padStart(2)} (0-${cb}) : adv ${dcb} :  A := A / (2**${dcb})`,
        1 : `${offset.toFixed().padStart(2)} (1-${cb}) : bxl ${lit} :  B := B ^ ${lit}`,
        2 : `${offset.toFixed().padStart(2)} (2-${cb}) : bst ${dcb} :  B := ${dcb} & 7`,
        3 : `${offset.toFixed().padStart(2)} (3-${cb}) : jnz ${lit} :  if (A==0) goto ${lit}`,
        4 : `${offset.toFixed().padStart(2)} (4-${cb}) : bxc ${"_"} :  B := B ^ C`,
        5 : `${offset.toFixed().padStart(2)} (5-${cb}) : out ${dcb} :  print(${dcb})`,
        6 : `${offset.toFixed().padStart(2)} (6-${cb}) : bdv ${dcb} :  B := A / (2**${dcb})`,
        7 : `${offset.toFixed().padStart(2)} (7-${cb}) : cdv ${dcb} :  C := A / (2**${dcb})`,
    }[opcode]
};

const step = (stdout:(out:number)=>void)=>(cp:Computer)=>{
    if (cp.pointer >= cp.program.length) throw new Error("eh");
    const opcode = cp.program[cp.pointer];
    const combo = cp.program[cp.pointer+1];
    const instruction = decode(opcode);
    //console.log(`>>> ${opcode}:${instruction.name} ${combo}`);
    return instruction(stdout)(cp)(combo as any)
}
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
const print_state = (cp:Computer)=>{
    console.log(`>>> ABC:  ${cp.A} ${cp.B} ${cp.C}  `)
    console.log(`>>> PROG: ${cp.program}`);
    console.log(`>>> P: ${
            cp.pointer.toFixed(0).padStart(2)
        } ${
            Array.from({length:cp.pointer*2}).fill("-").join("")
        }^ ^`
    )
    console.log(describe(cp.pointer)(cp.program[cp.pointer])(cp.program[cp.pointer+1]))

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

function solve(input:string){
    const computer = parse_input(input);
    console.log("initial",  computer)
    const stdout:number[] = []
    const final_state = run(i=>stdout.push(i))(computer)
    console.log("Output: ", stdout.join(","))
    //console.log("Output: ", quick_run(computer.A).join(","))
}
// solve(`
// Register A: 729
// Register B: 0
// Register C: 0

// Program: 0,1,5,4,3,0
// `)
//solve(await Deno.readTextFile("input.txt"))

function solve2(input:string){
    
    const computer = parse_input(input);
    console.log("---")
    console.log("Solve 2 - Initial Computer:")
    print_state(computer)
    console.log("---")
    for(let offset =0;offset<computer.program.length;offset+=2){
        console.log(describe(offset)(computer.program[offset])(computer.program[offset+1]))
    }
    console.log("---")
    const self_replicator = search(computer)
    console.log("Found!")
    console.log("Value of A: "+self_replicator.A);
}
// solve2(`
// Register A: 2024
// Register B: 0
// Register C: 0

// Program: 0,3,5,4,3,0
// `);
//solve2(await Deno.readTextFile("input.txt"));

// `
// B1 = A1 & 7
// B2 = B1 ^ 1
// C1 = A1 / (2**B2)
// B3 = B2 ^ C1
// A2 = A1 / 8
// B4 = B3 ^ 6
// pritn(B4)
// jnz A2



// B2 = (A1 & 7) ^ 1
// C1 = A1 / (2**((A1 & 7) ^ 1))
// B3 = (((A1 & 7) ^ 1) ^ (A1 / (2**((A1 & 7) ^ 1))))
// A2 = A1 / 8
// B4 = (((A1 & 7) ^ 1) ^ (A1 / (2**((A1 & 7) ^ 1)))) ^ 6
// pritn(B4)
// jnz A2
//`

let input = parse_input(await Deno.readTextFile("input.txt"));
//solve(await Deno.readTextFile("input.txt"))
//console.log(quick_search())
console.log("target",input.program)
run(console.log)({...input,A:3933903358*8*8})
// quick: 1,6,3,6,5,6,5,1,7
//        1,6,3,6,5,6,5,1,7

// pointer 11 A 3933903034
// pointer 11 A 3933903035
// pointer 11 A 3933903039
// pointer 11 A 3933903354
// pointer 11 A 3933903355
// pointer 11 A 3933903358