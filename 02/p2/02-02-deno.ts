const input = await Deno.readTextFile("../input.txt");
// const input = `7 6 4 2 1
// 1 2 7 8 9
// 9 7 6 2 1
// 1 3 2 4 5
// 8 6 4 4 1
// 1 3 6 7 9`


const pairwise = function* <T>(arr: T[]): Generator<[T, T]> {
    for (let i = 1; i < arr.length; i++) {
      yield [arr[i - 1], arr[i]];
    }
};

const diff = (a:number[]) =>pairwise(a).map(([a,b])=>b-a);

const safe :(arr:number[])=>boolean = (arr) =>{
    const diffs = diff(arr).toArray();
    return diffs.every(i=>i>=1  && i<= 3) || diffs.every(i=>i<=-1 && i>=-3)
};

const omit = function* <T>(arr:T[]):Generator<T[]>{
    yield arr
    for(let i = 0;i<arr.length;i++){
        yield arr.toSpliced(i,1)
    }
}

console.log(
    input
    .trim()
    .split("\n")
    .map(i=>{
        const levels = i.split(" ").map(parseFloat);
        return omit(levels).some(safe);
    })
    .reduce((a,b)=>a+b)
)
