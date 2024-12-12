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
type Vector2 = {
    x:number,y:number
}
type Segment = {
    a:Vector2,
    b:Vector2
}
const vec_eq = (a:Vector2, b:Vector2) => a.x==b.x && a.y==b.y;
const dot = (a:Vector2, b:Vector2) => a.x*b.x+a.y*b.y;
const sub = (a:Vector2, b:Vector2):Vector2 => ({x:a.x-b.x, y:a.y-b.y});
const norm = (a:Vector2):Vector2 => {const mag=Math.sqrt(dot(a,a)); return {x:a.x/mag, y:a.y/mag}};
const can_combine = ({a:a1,b:b1}:Segment,{a:a2,b:b2}:Segment) => {
    if(vec_eq(b1,a2)){
        return dot(norm(sub(b1,a1)), norm(sub(b2,a1)))===1;
    }else if(vec_eq(b2, a1)){
        return dot(norm(sub(b1,a2)), norm(sub(b2,a2)))===1;
    }else{
        return false;
    }
};
const combine = ({a:a1,b:b1}:Segment,{a:a2,b:b2}:Segment)=>{
    if(vec_eq(b1,a2)){
        return {a:a1, b:b2};
    }else if(vec_eq(b2, a1)){
        return {a:a2, b:b1};
    }
    throw new Error("uuugh");
};
type PlantEdge = {
    adjacent_position:Position,
    adjacent_id:string,
    separating_line:Segment
}
const index_all_neighbors_with_edges = ([row,col]:Position):PlantEdge[] => [
    {adjacent_position:[row - 1, col], adjacent_id:id([row - 1, col]), separating_line:{a:{x:col  ,y:row  },b:{x:col+1,y:row  }}},
    {adjacent_position:[row, col - 1], adjacent_id:id([row, col - 1]), separating_line:{a:{x:col  ,y:row+1},b:{x:col  ,y:row  }}},
    {adjacent_position:[row + 1, col], adjacent_id:id([row + 1, col]), separating_line:{a:{x:col+1,y:row+1},b:{x:col  ,y:row+1}}},
    {adjacent_position:[row, col + 1], adjacent_id:id([row, col + 1]), separating_line:{a:{x:col+1,y:row  },b:{x:col+1,y:row+1}}},
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
    const result = regions.entries().map(([region_id, region])=>{
        const area = region.size;
        const segments = Array.from(region.values().flatMap(
            position=>{
                const segments:Segment[] = index_all_neighbors_with_edges(position)
                    .flatMap(
                        plant_edge=>{
                            if(!region.has(plant_edge.adjacent_id)){
                                return [plant_edge.separating_line]
                            }
                            return []
                        }
                    );
                    return segments
                }
            ));
        let found_joint = true;
        while(found_joint){
            found_joint = false;
            for(let i = 0; i<segments.length;i++){
                const s1 = segments[i];
                for(let j=i+1;j<segments.length;j++){
                    if(i===j) continue;
                    const s2 = segments[j];
                    //console.log(JSON.stringify(s1),JSON.stringify(s2), can_combine(s1,s2));
                    if(can_combine(s1,s2)){
                        found_joint = true;
                        segments.splice(j,1);
                        segments.splice(i,1);
                        segments.push(combine(s1, s2))
                        break
                    }
                }
                if (found_joint) break;
            }
        }
        //console.log(region_id, segments);
        return area * segments.length;
    }).reduce((a,b)=>a+b);
    return result
}

console.assert(fencing_cost(
`AAAA
BBCD
BBCC
EEEC
`)==80);
console.assert(fencing_cost(
    `EEEEE
EXXXX
EEEEE
EXXXX
EEEEE
`)==236);
console.assert(fencing_cost(
`AAAAAA
AAABBA
AAABBA
ABBAAA
ABBAAA
AAAAAA
`)==368);

const input = await Deno.readTextFile("input.txt");
console.log("result", fencing_cost(input))



