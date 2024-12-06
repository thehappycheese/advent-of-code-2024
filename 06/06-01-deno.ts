const input = await Deno.readTextFile("input.txt");
const lines = input.trim().split("\n");
const cells = lines.map(item=>item.split(""));
type Position = [row:number, col:number];
let guard:Position;
const size_r =  lines.length;
const size_c = lines[0].length;
cells.forEach((row,row_index)=>row.forEach((cell, col_index)=>cell==="^"?(guard=[row_index, col_index]):""));
const to_index = ([r, c]:Position) => r*size_c+c;
const add = (a:Position, b:Position):Position=>[a[0]+b[0],a[1]+b[1]];
const right = (a:Position):Position => [a[1], -a[0]];
let direction:Position = [-1,0];
const visited:Map<number, boolean> = new Map();
while (guard[0]>=0 && guard[0]<size_r && guard[1]>=0 && guard[1]<size_c){
    let next_position = add(guard, direction);
    if(cells[next_position[0]][next_position[1]]==="#"){
        direction = right(direction);
        next_position = add(guard, direction);
    }
    visited.set(to_index(guard),true);
    guard = next_position;
}
console.log(visited.values().reduce((a,b)=>a+b));


 
