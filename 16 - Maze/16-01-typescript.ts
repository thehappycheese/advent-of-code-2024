import { Vector2 } from "./Vector2.ts";


// MARK: Types
type RotationType = "clockwise"|"anti-clockwise";
type TranslationType = "next";
type DirectionType = "N"|"E"|"W"|"S";
type Node = {
    pos:Vector2
    facing:DirectionType
    outbound:Map<RotationType|TranslationType, Edge>
}
type Edge = {
    to:Node
    cost:1|1000
}
type Trail = {
    current:Node,
    cost_so_far:number,
    previous?:Trail
}
type OpenTrails = {
    trail:Trail,
    closed:Set<string>
}[]
type LoopyType<T=unknown> = IterableIterator<T>|Iterable<T>

// MARK: Helpers
// const index_neighbors = (pos:Vector2, world_size:Vector2) => [
//     {x:pos.x     , y:pos.y + 1, }, // N
//     {x:pos.x - 1 , y:pos.y,     }, // E
//     {x:pos.x + 1 , y:pos.y,     }, // W
//     {x:pos.x     , y:pos.y - 1, }, // S
// ].filter(
//     neb => neb.x >= 0 && neb.x < world_size.x && neb.y >= 0 && neb.y < world_size.x
// );

const hash_node = (n:Vector2, direction:DirectionType) => `${direction}${n.x}|${n.y}`;
const hash_trail = (t:Trail) => hash_node(t.current.pos, t.current.facing);

function * pairwise<T>(items:LoopyType<T>):Generator<[T,T]>{
    let last;
    let first = true;
    for(const item of items){
        if (first) {
            first = false;
            last = item
            continue
        }
        yield [last!, item]
        last = item
    }
}
function * repeat_first<T>(items:LoopyType<T>):Generator<T>{
    let first = undefined;
    for (const item of items){
        first = first ?? item
        yield item
    }
    if(first) yield first;
}
const pair_loop = <T,>(items:LoopyType<T>) =>pairwise(repeat_first(items))
const direction_to_offset=(direction:DirectionType):Vector2=>{
    switch (direction){
        case "N":
            return {x:0, y:-1};
        case "S":
            return {x:0, y:1};
        case "E":
            return {x:1, y:0};
        case "W":
            return {x:-1, y:0};
    }
}


function solve(input:string){
    const nodes:Map<string, Node> = new Map();

    const tiles = input.trim().split("\n").map(row=>row.split(""));
    const walls = new Set();
    let start_node:Node;
    let end_nodes:Node[];
    let end_node_hash:Set<string>;

    // MARK: Find Nodes
    tiles.forEach((row, y)=>row.forEach((cell, x)=>{
        if(cell==="#"){
            walls.add(Vector2.hash({x,y}))
        }else{
            let pos = {x,y};
            let clockwise:DirectionType[] = ["E","S","W","N"];
            let new_clockwise_nodes:Node[] = clockwise.map(facing=>({
                pos,
                facing,
                outbound:new Map()
            }));
            pair_loop(new_clockwise_nodes).forEach(([n1, n2])=>{
                n1.outbound.set("clockwise", {to:n2, cost:1000});
                n2.outbound.set("anti-clockwise", {to:n1, cost:1000});
            })
            new_clockwise_nodes.forEach(node=>nodes.set(hash_node(node.pos,node.facing), node));
            if(cell==="S"){
                // TODO: capture start
                start_node = new_clockwise_nodes[0];
            }else if(cell==="E"){
                
                end_nodes = new_clockwise_nodes;
                end_node_hash = new Set(end_nodes.map(node=>hash_node(node.pos, node.facing)));
            }
        }
    }));

    // MARK: Build Edges
    for(let node of nodes.values()){
        let neighbor = nodes.get(hash_node(
            Vector2.add(node.pos,direction_to_offset(node.facing)),
            node.facing
        ));
        if(neighbor){
            node.outbound.set("next", {to:neighbor, cost:1})
        }
    }
    
    // MARK: Path Finding
    
    const trail:Trail = {
        cost_so_far:0,
        current:start_node!,
    };
    let open_trails:OpenTrails = [{trail, closed:new Set(hash_trail(trail))}];
    const finished_paths:Trail[] = [];
    let lowest_cost_so_far = Infinity;
    while(open_trails.length>0){
        for(const {trail, closed} of open_trails){
            const hash = hash_node(trail.current.pos,trail.current.facing);
            closed.add(hash);
            if(end_node_hash!.has(hash)){
                if(trail.cost_so_far < lowest_cost_so_far){
                    lowest_cost_so_far = trail.cost_so_far
                    finished_paths.push(trail);
                    console.log(finished_paths.length);
                }
            }
        }
        // could be flat map?
        const new_open_trails = [];
        for(const {trail, closed} of open_trails){
            const next_trails:OpenTrails = trail.current.outbound.values().map(({cost, to})=>({
                trail:{
                    cost_so_far:trail.cost_so_far+cost,
                    current:to,
                    previous:trail
                },
                closed:new Set([...closed, hash_node(to.pos, to.facing)])
            })).filter(({trail})=>!closed.has(hash_trail(trail))).toArray();
            new_open_trails.push(...next_trails);
        }
        open_trails = new_open_trails;
    }
    return {tiles, walls, finished_paths};
}
async function the_passage_of_time(milliseconds=100){
    await new Promise(resolve=>setTimeout(resolve, milliseconds))
}

async function draw_solution(solution:Trail, world_size:Vector2, walls:Set<string>){
    let out:string[][] = Array.from({length:world_size.y}, (_,y)=>
        Array.from({length:world_size.x},(_,x)=>{
            if(walls.has(Vector2.hash({x,y}))){
                return "█"
            }else{
                return " "
            }
        }
    ))
    let item:Trail|false = solution;
    while(item){
        let pos = item.current.pos;
        let cost_so_far = item.cost_so_far;
        out[pos.y][pos.x] = item.current.facing;
        item = item.previous ?? false
        console.log("\x1b[H\x1b[J")
        console.log(out.map(i=>i.join("")).join("\n"));
        console.log(cost_so_far)
        await the_passage_of_time();
    }
}
async function draw_solutions(solutions:Trail[], world_size:Vector2, walls:Set<string>){
    let out:string[][] = Array.from({length:world_size.y}, (_,y)=>
        Array.from({length:world_size.x},(_,x)=>{
            if(walls.has(Vector2.hash({x,y}))){
                return "█"
            }else{
                return " "
            }
        }
    ))
    for(const solution of solutions){
        let item:Trail|false = solution;
        while(item){
            let pos = item.current.pos;
            let cost_so_far = item.cost_so_far;
            out[pos.y][pos.x] = item.current.facing;
            item = item.previous ?? false
            console.log("\x1b[H\x1b[J")
            console.log(out.map(i=>i.join("")).join("\n"));
            console.log(cost_so_far)
            await the_passage_of_time();
        }
    }
}


let {tiles, walls, finished_paths} = solve(`
###############
#.......#....E#
#.#.###.#.###.#
#.....#.#...#.#
#.###.#####.#.#
#.#.#.......#.#
#.#.#####.###.#
#...........#.#
###.#.#####.#.#
#...#.....#.#.#
#.#.#.###.#.#.#
#.....#...#.#.#
#.###.#.#.#.#.#
#S..#.....#...#
###############
`)
//console.log(solution.get("E10|3"));
//console.log(solution.length)
console.log(Deno.inspect(finished_paths,{depth:1, colors:true}));
await draw_solutions(finished_paths, {x:tiles[0].length, y:tiles.length}, walls)
// for(const path of finished_paths){
//     await draw_solution(path, {x:tiles[0].length, y:tiles.length}, walls)
// }
