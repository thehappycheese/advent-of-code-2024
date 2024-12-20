export type Computer = {
  A: number;
  B: number;
  C: number;
  program: number[];
  pointer: number;
};
type Instruction = (stdout: (out: number) => void) => (c: Computer) => (
  ((cb: Combo) => Computer) | ((cb: Literal) => Computer));
type Combo = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Literal = number;

const combo = (c: Computer) => (combo: Combo) => {
  switch (combo) {
    case 0:
    case 1:
    case 2:
    case 3:
      return combo;
    case 4:
      return c.A;
    case 5:
      return c.B;
    case 6:
      return c.C;
    default:
        print_state(c)
      throw new Error(`Invalid combo ${combo}`);
  }
};

const adv: Instruction = (_stdout: (out: number) => void) => (cp: Computer) => (cb: Combo) => ({
  ...cp,
  pointer: cp.pointer + 2,
  A: Math.floor(
    cp.A / Math.pow(2, combo(cp)(cb))
  )
});
const bxl: Instruction = (_stdout: (out: number) => void) => (cp: Computer) => (lit: number) => ({
  ...cp,
  pointer: cp.pointer + 2,
  B: cp.B ^ lit
});
const bst: Instruction = (_stdout: (out: number) => void) => (cp: Computer) => (cb: Combo) => ({
  ...cp,
  pointer: cp.pointer + 2,
  B: combo(cp)(cb) & 7
});
const jnz: Instruction = (_stdout: (out: number) => void) => (cp: Computer) => (lit: number) => ({
  ...cp,
  pointer: cp.A === 0 ? cp.pointer + 2 : lit,
});
const bxc: Instruction = (_stdout: (out: number) => void) => (cp: Computer) => (_: number) => ({
  ...cp,
  pointer: cp.pointer + 2,
  B: cp.B ^ cp.C
});
const out: Instruction = (stdout: (out: number) => void) => (cp: Computer) => (cb: Combo) => {
  stdout(combo(cp)(cb) & 7);
  return {
    ...cp,
    pointer: cp.pointer + 2,
  };
};
const bdv: Instruction = (_stdout: (out: number) => void) => (cp: Computer) => (cb: Combo) => ({
  ...cp,
  pointer: cp.pointer + 2,
  B: Math.floor(
    cp.A / Math.pow(2, combo(cp)(cb))
  )
});
const cdv: Instruction = (_stdout: (out: number) => void) => (cp: Computer) => (cb: Combo) => ({
  ...cp,
  pointer: cp.pointer + 2,
  C: Math.floor(
    cp.A / Math.pow(2, combo(cp)(cb))
  )
});

export const decode = (opcode: number) => [
  adv, bxl, bst, jnz, bxc, out, bdv, cdv
][opcode];


export const step = (stdout:(out:number)=>void)=>(cp:Computer)=>{
    if (cp.pointer >= cp.program.length) throw new Error("eh");
    const opcode = cp.program[cp.pointer];
    const combo = cp.program[cp.pointer+1];
    const instruction = decode(opcode);
    return instruction(stdout)(cp)(combo as any)
}

export const run = (stdout:(out:number)=>void)=>(cp:Computer)=>{
    let state = cp;
    //print_state(state)
    while(state.pointer<state.program.length){
        //console.log("---")
        state = step(stdout)(state)
        //print_state(state)
    }
    return state
}
export const run_generate = function* (cp:Computer){
    let state = cp;
    while(state.pointer<state.program.length){
        let out = undefined;
        state = step(o=>out=o)(state);
        if(out!==undefined){
            yield out
        }
    }
}

export const run_to_list = (cp:Computer)=>{
    const result:number[] = [];
    run(i=>result.push(i))(cp);
    return result;
}

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
    0 : `${offset.toFixed().padStart(2)} (0-${cb}) : adv ${dcb} ::    A := A / (2**${dcb})`,
    1 : `${offset.toFixed().padStart(2)} (1-${cb}) : bxl ${lit} ::    B := B ^ ${lit}`,
    2 : `${offset.toFixed().padStart(2)} (2-${cb}) : bst ${dcb} ::    B := ${dcb} & 7`,
    3 : `${offset.toFixed().padStart(2)} (3-${cb}) : jnz ${lit} ::    if (A==0) goto ${lit}`,
    4 : `${offset.toFixed().padStart(2)} (4-${cb}) : bxc ${"_"} ::    B := B ^ C`,
    5 : `${offset.toFixed().padStart(2)} (5-${cb}) : out ${dcb} ::    print(${dcb})`,
    6 : `${offset.toFixed().padStart(2)} (6-${cb}) : bdv ${dcb} ::    B := A / (2**${dcb})`,
    7 : `${offset.toFixed().padStart(2)} (7-${cb}) : cdv ${dcb} ::    C := A / (2**${dcb})`,
}[opcode]
};
export const print_state = (cp:Computer)=>{
    console.log(`>>> ABC:  ${cp.A} ${cp.B} ${cp.C}  `)
    console.log(`>>> PROG: ${cp.program}`);
    console.log(`>>> P: ${
            cp.pointer.toFixed(0).padStart(2)
        } ${
            Array.from({length:cp.pointer*2}).fill("-").join("")
        }^ ^`
    )
}
export const decompile = (cp:Computer)=>{
    const out:string[] = ["---"]
    for(let pointer = 0;pointer<cp.program.length;pointer+=2){
        out.push(
            describe(cp.pointer)(cp.program[pointer])(cp.program[pointer+1] as Combo)!
        )
    }
    return [...out,"---"].join("\n")
}