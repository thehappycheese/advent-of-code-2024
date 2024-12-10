const input = (await Deno.readTextFile("input.txt"));
// const input = `89010123
// 78121874
// 87430965
// 96549874
// 45678903
// 32019012
// 01329801
// 10456732
// `;

const elevations = input.trim().split("\n").map(row => row.split("").map(parseFloat))
const count_rows = elevations.length;
const count_cols = elevations[0].length;

type Trail = {
    current:[number, number],
    elevation:number,
    previous?:Trail
}

const trail_heads:Trail[] = elevations.reduce<any>((acc, row, row_index) =>
    [
        ...acc,
        ...row.reduce<any>(
            (acc, cell, col_index) => cell === 0 ?
                [...acc, {current:[row_index, col_index], elevation:cell}] : acc
            , [])
    ]
    , []);

const index_neighbors = ([row,col]:[number, number]) => [
    [row - 1, col],
    [row, col - 1],
    [row + 1, col],
    [row, col + 1],
].filter(
    ([r, c]) => r >= 0 && r < count_rows && c >= 0 && c < count_cols
);

const id = ([a, b]:[number,number])=>`${a}-${b}`;
function head(t:Trail):Trail {
    return t.previous ? head(t.previous): t;
};

const closed_trails:Trail[] = [];
let open_trails = [...trail_heads];
while(open_trails.length>0){
    const next_trails:Trail[] = [];
    for (const trail of open_trails) {
        if(trail.elevation===9){
            closed_trails.push(trail);
        }
        next_trails.push(...index_neighbors(trail.current).flatMap(
            ([row,col])=>elevations[row][col]-trail.elevation===1 ? [{
                current:[row,col],
                elevation:elevations[row][col],
                previous:trail
            } as Trail]:[]
        ))
    }
    open_trails=next_trails;
}
const paths = closed_trails.map(trail=>[id(head(trail).current),id(trail.current)]);
const scores_distinct = new Map();
for (const [head, tail] of paths){
    if(scores_distinct.has(head)){
        scores_distinct.get(head).add(tail);
    }else{
        scores_distinct.set(head, new Set([tail]));
    }
}
console.log(`
The total score for all trailheads counting distinct summits is  : ${scores_distinct.values().reduce((a,b)=>a+b.size,0)}
The total number of unique paths is    : ${paths.length}
`);
