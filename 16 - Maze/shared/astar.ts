
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
    const open_set:CostPair<Node, Hash>[] = [{node:start, hash:start_hash, cost_f:0}];
    const came_from:Map<Hash, Node> =  new Map();
    const cost_g:Map<Hash, number> = new Map([[start_hash, 0]]);
    const cost_f:Map<Hash, number> = new Map([[start_hash, heuristic(start)]]);
    while (open_set.length>0){
        const current = open_set.sort((a,b)=>b.cost_f-a.cost_f).pop()!;
        const current_hash = node_to_hash(current.node);
        if(current_hash===goal_hash) {
            // MARK: reconstruct path
            const path = reconstruct_path(current.node, node_to_hash, came_from);
            return {cost:current.cost_f, path};
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
    const came_from:Map<Hash, Node> =  new Map();
    const cost_g:Map<Hash, number> = new Map([[start_hash, 0]]);
    const cost_f:Map<Hash, number> = new Map([[start_hash, heuristic(start)]]);
    while (open_set.length>0){
        const current = open_set.sort((a,b)=>b.cost_f-a.cost_f).pop()!;
        const current_hash = node_to_hash(current.node);
        if(current_hash===goal_hash) {
            // MARK: reconstruct path

            let path = [current.node];
            let pointer:Node|undefined = current.node;
            while(true){
                const hash_pointer = node_to_hash(pointer!);
                pointer = came_from.get(hash_pointer);
                if (pointer){
                    path.push(pointer)
                }else{
                    break
                }
            }
            return {cost:current.cost_f, path:path.reverse()};
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