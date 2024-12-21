
type AStarArgs<Node, Hash> = {
    start:Node,
    goal:Node,

    /**Must be "admissible" and consistent */
    heuristic: (node:Node)=>number,

    /**Return the neighbors of a given node */
    adjacent: (node:Node)=>{to:Node, cost:number}[],
    node_to_hash:(node:Node)=>Hash,
    //hash_to_node:(hash:Hash)=>Node,
};
type CostPair<Node, Hash> = {
    node:Node,
    hash:Hash,
    cost_f:number
}

export const reconstruct_path = <Node, Hash>(
    node:Node,
    node_to_hash:(node:Node)=>Hash,
    came_from:Map<Hash, Node>
) => {
    const path = [node];
    let pointer:Node|undefined = node;
    while(true){
        const hash_pointer = node_to_hash(pointer!);
        pointer = came_from.get(hash_pointer);
        if (pointer){
            path.push(pointer)
        }else{
            break
        }
    }
    return path.reverse();
}

export const shortest_path = function <Node, Hash>(
    {
        start,
        goal,
        heuristic,
        adjacent,
        node_to_hash,
        
    }:AStarArgs<Node, Hash>
) {
    const start_hash = node_to_hash(start);
    const goal_hash = node_to_hash(goal);
    // TODO: replace open_set with min heap. Probs not worth the bother in js methinks?
    const initial_cost = heuristic(start);
    const open_set:CostPair<Node, Hash>[] = [{node:start, hash:start_hash, cost_f:initial_cost}];
    const came_from:Map<Hash, Node> =  new Map();
    const cost_g:Map<Hash, number> = new Map([[start_hash, 0]]);
    const cost_f:Map<Hash, number> = new Map([[start_hash, initial_cost]]);
    while (open_set.length>0){
        const current = open_set.sort((a,b)=>b.cost_f-a.cost_f).pop()!;
        const current_hash = node_to_hash(current.node);
        if(current_hash===goal_hash) {
            // MARK: reconstruct path
            const path = reconstruct_path(current.node, node_to_hash, came_from);
            return {
                cost:current.cost_f,
                path,
                cost_g,
                cost_f
            };
        }
        for (const {to:neighbor, cost} of adjacent(current.node)){
            const tentative_score = cost_g.get(current_hash)! + cost;
            const neighbor_hash = node_to_hash(neighbor)
            if(
                   !cost_g.has(neighbor_hash)
                || tentative_score < cost_g.get(neighbor_hash)!
            ){
                const neighbor_cost_f = tentative_score+heuristic(neighbor);
                came_from.set(neighbor_hash, current.node);
                cost_g.set(neighbor_hash, tentative_score);
                cost_f.set(neighbor_hash,neighbor_cost_f);
                if (open_set.every(item=>item.hash!=neighbor_hash)) open_set.push({
                    node:neighbor,
                    hash:neighbor_hash,
                    cost_f:neighbor_cost_f
                })
            }
        }
    }
    throw new Error("failed to find a path")
}


export const reconstruct_paths = <Node, Hash>(
    initial_path:Hash[],
    end_node_hash:Hash,
    node_to_hash:(node:Node)=>Hash,
    came_from:Map<Hash, Node[]>
):Hash[][] => {
    const path = initial_path;
    const extra_paths = [];
    let pointer:Hash = end_node_hash;
    while(true){
        path.push(pointer);
        if(came_from.has(pointer)){
            const arrived_from = came_from.get(pointer)!;
            if(arrived_from.length > 1){
                for(const extra of arrived_from.slice(1)){
                    extra_paths.push(...reconstruct_paths(
                        [...path],
                        node_to_hash(extra),
                        node_to_hash,
                        came_from
                    ))
                }
            }else if(arrived_from.length===0){
                throw new Error("Not good");
            }
            pointer = node_to_hash(arrived_from[0]);
        }else{
            break
        }
    }
    return [path.reverse(), ...extra_paths];
}


type FloodFillArgs<Hash> = {
    start:Hash,
    adjacent: (node:Hash)=>Hash[],
};
export const flood_fill = <Hash>({
    start,
    adjacent,
}:FloodFillArgs<Hash>):Set<Hash> => {
    let open_set:Hash[] = [start];
    const closed_set=new Set([start]);
    while(open_set.length>0){
        const new_open_set = [];
        for(const open of open_set){
            closed_set.add(open);
        }
        for(const open of open_set){
            new_open_set.push(...adjacent(open).filter(item=>!closed_set.has(item)))
        }
        open_set = new_open_set;
    }
    return closed_set;
}


export const all_shortest_paths = function <Node, Hash>(
    {
        start,
        goal,
        heuristic,
        adjacent,
        node_to_hash,
        
    }:AStarArgs<Node, Hash>
) {
    const start_hash = node_to_hash(start);
    const goal_hash = node_to_hash(goal);
    const open_set:CostPair<Node, Hash>[] = [{node:start, hash:start_hash, cost_f:0}];
    const came_from:Map<Hash, Node[]> =  new Map();
    const cost_g:Map<Hash, number> = new Map([[start_hash, 0]]);
    const cost_f:Map<Hash, number> = new Map([[start_hash, heuristic(start)]]);
    while (open_set.length>0){
        const current = open_set.sort((a,b)=>b.cost_f-a.cost_f).pop()!;
        const current_hash = node_to_hash(current.node);
        for (const {to:neighbor, cost} of adjacent(current.node)){
            const tentative_score = cost_g.get(current_hash)! + cost;
            const neighbor_hash = node_to_hash(neighbor)
            
            const is_visited_location = cost_g.has(neighbor_hash);
            const is_new_location = !is_visited_location;
            const is_superior_path = is_visited_location && tentative_score < cost_g.get(neighbor_hash)!;
            const is_equivalent_path = is_visited_location && tentative_score === cost_g.get(neighbor_hash)!;
            if(is_new_location || is_superior_path || is_equivalent_path){
                if(is_new_location || is_superior_path){
                    came_from.set(neighbor_hash, [current.node]);
                }else if(is_equivalent_path){
                    came_from.get(neighbor_hash)?.push(current.node);
                }else{
                    throw new Error("why?");
                }
                const neighbor_cost_f = tentative_score+heuristic(neighbor);
                cost_g.set(neighbor_hash, tentative_score);
                cost_f.set(neighbor_hash, neighbor_cost_f);
                if (open_set.every(item=>item.hash!=neighbor_hash)) open_set.push({
                    node:neighbor,
                    hash:neighbor_hash,
                    cost_f:neighbor_cost_f
                })
            }
        }
    }
    return {
        came_from, 
        cost_f,
        cost_g,
        // paths:reconstruct_paths(
        //     [],
        //     goal_hash,
        //     node_to_hash,
        //     came_from
        // )
        visited:flood_fill({
            start:goal_hash,
            adjacent: hash=>(came_from.get(hash)??[]).map(node_to_hash)
        })
    }
}

