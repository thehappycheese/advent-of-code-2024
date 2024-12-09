const input = (await Deno.readTextFile("input.txt")).trim()
//const input = "2333133121414131402"


const pairwise = function* <T>(arr: T[]): Generator<[T, T]> {
    for (let i = 1; i < arr.length; i++) {
      yield [arr[i - 1], arr[i]];
    }
};
const enumerate = function * <T>(iter:Iterable<T>):Generator<[number, T]>{
    let offset = 0;
    for(let item of iter){
        yield [offset, item]
        offset++;
    }
}

const chunks = function* <T>(arr: T[]): Generator<[T, T]> {
    for (let i = 1; i < arr.length; i+=2) {
      yield [arr[i - 1], arr[i]];
    }
};

type File = {
    offset:number,
    size:number
    id:number,
}
type Gap = Omit<File, "id">

const disk_map = chunks(Array.from(input+"0").map(parseFloat))
const files:File[] = [];
const gaps:Gap[] = [];
let offset:number = 0;
for(const [id, [file_size, gap_size]] of enumerate(disk_map)){

    files.push({
        offset,
        size:file_size,
        id
    })
    if(gap_size>0){
        gaps.push({
            offset:offset+file_size,
            size:gap_size
        })
    }
    offset+=file_size+gap_size
}
const scale = 30;
let output = `
<html>
<head>
<style>
.box{
    position:absolute;
    background-color:grey;
    border:1px solid black;
    box-sizing:border-box;
}
</style>
</head>
<body style="position:relative;">
${files.map(({offset, size, id})=>`<div class="box" style="left:${offset*scale}px;top:2em; width:${size*scale}px;height:1em;">${id}</div>`).join("")}
${gaps.map(({offset, size})=>`<div class="box" style="left:${offset*scale}px;top:3em; width:${size*scale}px;height:1em;"></div>`).join("")}
`

const final_files = [];
for(const file of files.toReversed()){
    let not_moved_file = true;
    for(const gap of gaps){
        if(gap.offset>file.offset){
            break
        }
        if (file.size <= gap.size){
            final_files.push({
                ...file,
                offset:gap.offset
            });
            gap.size -= file.size;
            gap.offset += file.size;
            not_moved_file = false;
            break
        }
    }
    if(not_moved_file){
        final_files.push(file);
    }
}
console.log(files)
console.log(final_files.toSorted((a,b)=>a.offset-b.offset))

const check_sum = ({offset, size, id}:File) => {
    let result = 0;
    for(let i=0;i<size;i++){
        result += (offset+i)* id
    }
    return result
};


console.log(final_files.map(check_sum).reduce((a,b)=>a+b))

let result = final_files.map(item=>({...item,check_sum:check_sum(item)}));
Deno.writeTextFile("out.json",JSON.stringify(result))


output += `${final_files.map(({offset, id, size})=>`<div class="box" style="left:${offset*scale}px;top:4em; width:${size*scale}px;height:1em;">${id}:${size}</div>`).join("")}`

output += "</body></html>";

Deno.writeTextFile("test.html", output)
// WRONG: 8632330985597