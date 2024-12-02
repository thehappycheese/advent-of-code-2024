const input = await Deno.readTextFile("../input.txt");

console.log(
    input
    .trim()
    .split("\n")
    .map(i=>{
        const r = i
            .split(" ")
            .map(parseFloat)
            .reduce<[number[],number|null]>(
                (a,b)=>[[...a[0], b-(a[1]??0)], b],
                [[],null]
            )[0].slice(1);
        return r.every(i=>i>=1 && i<=3) || r.every(i=>i<=-1 && i>=-3)
    }).reduce((a,b)=>a+b)
)
