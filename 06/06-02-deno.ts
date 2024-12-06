const input = await Deno.readTextFile("input.txt");
// const input = `....#.....
// .........#
// ..........
// ..#.......
// .......#..
// ..........
// .#..^.....
// ........#.
// #.........
// ......#...`;

const lines = input.trim().split("\n");
const cells = lines.map(item=>item.split(""));
type Position = [row:number, col:number];
const guard:Position = cells.reduce<any>(
    (acc, row, row_index) => acc.length===0 ? row.reduce<any>(
        (acc, cell, col_index)=>cell==="^"?[row_index, col_index]:acc,
        []
    ):acc,
    []
)
const size_r =  lines.length;
const size_c = lines[0].length;
const dir_to_num = ([dr,dc]:Position):number => (dr+1)<<2|(dc+1);
const to_index = (cols:number, [r, c]:Position, [dr,dc]:Position) => (r*cols+c)<<4|dir_to_num([dr,dc]);
const add = (a:Position, b:Position):Position=>[a[0]+b[0],a[1]+b[1]];
const right = (a:Position):Position => [a[1], -a[0]];
const is_in_bounds = (pos:Position) => pos[0]>=0 && pos[0]<size_r && pos[1]>=0 && pos[1]<size_c;
const collide_existing = (pos:Position) => cells[pos[0]][pos[1]]==="#";
const eq = (a:Position,b:Position)=> a[0]===b[0] && a[1]===b[1];

function loops(new_obs:Position, guard_start:Position){
    const at_pos = cells[new_obs[0]][new_obs[1]]
    if(at_pos==="#" || at_pos==="^"){
        return false
    }
    const visited:Map<number, boolean> = new Map();
    let guard:Position = [...guard_start];
    let direction:Position = [-1,0];
    visited.set(to_index(size_c, guard, direction),true);


    while (is_in_bounds(guard)){
        
        let next_position = add(guard, direction);
        for(let attempt = 0;attempt<2;attempt++){
            if(!is_in_bounds(next_position)){
                return false
            }
            if(collide_existing(next_position) || eq(new_obs, next_position)){
                direction = right(direction);
                next_position = add(guard, direction);
            }else{
                break;
            }
        }
        const map_index = to_index(size_c, next_position, direction);
        if (visited.get(map_index)){
            return true
        }
        visited.set(map_index,true);
        guard = next_position;
    }
    return false
}

let counter = 0;
for(let r =0;r<cells.length;r++){
    for(let c =0;c<cells[0].length;c++){
        if (loops([r,c], guard)){
            counter++
        }
    }
}
console.log(counter)
