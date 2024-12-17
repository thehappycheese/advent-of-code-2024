import { Node } from "../16-01-typescript.ts";



async function draw_solution(
  solution: Node[],
  tiles: string[][],
  cost: number
) {
  const out: string[][] = tiles.map(a => a.map(c => c.replace(/[.SE]/, " ").replace("#", "█")));
  for (const node of solution) {
    const pos = node.pos;
    out[pos.y][pos.x] = node.facing;
    console.log("\x1b[H\x1b[J");
    console.log(out.map(i => i.join("")).join("\n"));
    console.log(cost);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
