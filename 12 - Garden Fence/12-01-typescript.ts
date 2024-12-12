// ======= TYPES =======
type Position = [row:number, col:number];
// ======= HELPERS =======
const id = ([row, col]:Position)=>`${row}-${col}`;
const index_all_neighbors = ([row,col]:Position):Position[] => [
    [row - 1, col] as Position,
    [row, col - 1] as Position,
    [row + 1, col] as Position,
    [row, col + 1] as Position,
];

// ======= SOLVER =======
export function fencing_cost(input:string){
    const grid = input.trim().split("\n").map(row=> row.split(""));
    const count_rows = grid.length;
    const count_cols = grid[0].length;

    const index_bound_neighbors = ([row,col]:Position):Position[] => index_all_neighbors([row,col]).filter(
        ([r, c]) => r >= 0 && r < count_rows && c >= 0 && c < count_cols
    );
    const build_region = (start_position:Position, start_plant_type:string, closed_positions:Map<string, Position>)=>{
        const open_positions = [{
            id:id(start_position),
            position:start_position
        }];
        const region = new Map()
        closed_positions.set(id(start_position), start_position);
        while (open_positions.length > 0){
            const pos = open_positions.pop()!;
            region.set(pos.id, pos.position);
            index_bound_neighbors(pos.position).forEach(neb_position=>{
                const plant_type = grid[neb_position[0]][neb_position[1]];
                const neb_id = id(neb_position);
                if(plant_type===start_plant_type && !closed_positions.has(neb_id)){
                    closed_positions.set(neb_id, neb_position);
                    open_positions.push({id:neb_id, position:neb_position});
                }
            });
        }
        return region
    }
    
    const closed_positions = new Map();
    const regions:Map<string, Map<string, Position>> = new Map();
    grid.forEach(
        (row, row_index)=>row.forEach(
            (plant_type, col_index)=>{
                const current_position:Position = [row_index, col_index];
                const current_id = id(current_position);
                if (!closed_positions.has(current_id)){
                    regions.set(`${plant_type}::${current_id}`, build_region(current_position, plant_type, closed_positions));
                }
            }
        )
    );
    // console.log(regions);
    const result = regions.values().map(region=>{
        const area = region.size;
        const perimeter = region.values().map(
            position=>
                index_all_neighbors(position)
                .map(id)
                .map(
                    plant_id=>region.has(plant_id)?0:1
                ).reduce<number>((a,b)=>a+b,0)
        ).reduce<number>((a,b)=>a+b,0)
        // console.log(area,perimeter)
        return area * perimeter
    }).reduce((a,b)=>a+b);
    // console.log(result);
    return result
}

console.assert(fencing_cost(
`AAAA
BBCD
BBCC
EEEC
`)==140);
console.assert(fencing_cost(`OOOOO\nOXOXO\nOOOOO\nOXOXO\nOOOOO\n`)==772);
console.assert(fencing_cost(
`RRRRIICCFF
RRRRIICCCF
VVRRRCCFFF
VVRCCCJFFF
VVVVCJJCFE
VVIVCCJJEE
VVIIICJJEE
MIIIIIJJEE
MIIISIJEEE
MMMISSJEEE
`)==1930);

const input = await Deno.readTextFile("input.txt");
console.log("result", fencing_cost(input))




