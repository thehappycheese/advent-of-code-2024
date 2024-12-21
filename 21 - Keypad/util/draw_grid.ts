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


export const draw_double_grid = ({
    size, 
    char_positions, 
    numbers = new Map(),
    background_char="░",
    scale_x=2,
    scale_y=2,
}:{
    size: Vector2, 
    char_positions: Record<string, Vector2[]>, 
    background_char?: string,
    numbers?:Map<Vector2, number>,
    scale_x?:number,
    scale_y?:number
}) => {
    const in_bounds = Vector2.in_bounds(size);
    const grid = Array.from({ length: size.y*scale_y }, () => Array(size.x*scale_x).fill(background_char));
    Object.entries(char_positions).forEach(([char, positions]) => {
        positions.filter(in_bounds).forEach(({x, y}) => {
            for(let i=0;i<scale_x;i++){
                for(let j=0;j<scale_y;j++){
                    grid[y*scale_y+j][x*scale_x+i] = char;
                }
            }
        });
    });
    numbers.entries().filter(([pos,_])=>in_bounds(pos)).forEach(([{x,y}, value])=>{
        const st = value.toString().slice(0,2);
        st.split("").forEach((char,offset)=>{
            grid[y*scale_y][x*scale_x+offset] = char

        });
    })
    grid.forEach(row => console.log(row.join("")));
};