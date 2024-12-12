type Position = [row:number, col:number];

const input = `AAAA
BBCD
BBCC
EEEC
`;
const grid = input.trim().split("\n").map(
    row=> row.split("")
);
const count_rows = grid.length;
const count_cols = grid[0].length;

const index_neighbors = ([row,col]:Position):Position[] => [
    [row - 1, col] as Position,
    [row, col - 1] as Position,
    [row + 1, col] as Position,
    [row, col + 1] as Position,
].filter(
    ([r, c]) => r >= 0 && r < count_rows && c >= 0 && c < count_cols
);
const id = ([row, col]:Position)=>`${row}-${col}`;
const closed_positions = new Map(); 
let plots = grid.flatMap(
    (row, row_index)=>row.flatMap(
        (cell, col_index)=>{
            const current_position:Position = [row_index, col_index];
            const current_id = id(current_position);
            if (!closed_positions.has(current_id)){
                build_region(row_index, col_index, cell);
            }
        }
    )
);

const build_region = (position:Position, type:string, current_id:string)=>{
    const result = [];
    index_neighbors(position).flatMap(cell_position=>{
        const cell_id = id(cell_position);
        const cell_type = grid[cell_position[0]][cell_position[1]];
        if(cell_type===type && !closed_positions.has(cell_id)){
            return 
        }
    })

}