import { Vector2 } from "./Vector2.ts";

export const draw_grid = (
    size: Vector2, 
    char_positions: Record<string, Vector2[]>, 
    background_char: string = "░"
) => {
    const grid = Array.from({ length: size.y }, () => Array(size.x).fill(background_char));
    Object.entries(char_positions).forEach(([char, positions]) => {
        positions.forEach(({x, y}) => {
            if (x < size.x && y < size.y) grid[y][x] = char;
        });
    });
    grid.forEach(row => console.log(row.join("")));
};