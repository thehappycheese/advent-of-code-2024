import { Vector2 } from "./Vector2.ts";

export class TerminalRenderer {
    private world_size:Vector2;
    private styledBuffer: string[][];

    constructor(world_size:Vector2) {
        this.world_size = world_size;

        // Initialize buffers
        this.styledBuffer = Array.from({ length: world_size.y }, () => Array(world_size.x).fill(" "));
    }
    render_initial(newStyled: string[][]) {
        for (let y = 0; y < this.world_size.y; y++) {
            for (let x = 0; x < this.world_size.x; x++) {
                if (this.styledBuffer[y][x] !== newStyled[y][x]) {
                    // Update raw buffer
                    this.styledBuffer[y][x] = newStyled[y][x];
                    this.styledBuffer[y][x] = newStyled[y][x];
                }
            }
        }
        console.log(newStyled.map(items=>items.join("")).join("\r\n"))
    }
    async render(newStyled: string[][]) {
        let updates = "";

        for (let y = 0; y < this.world_size.y; y++) {
            for (let x = 0; x < this.world_size.x; x++) {
                if (this.styledBuffer[y][x] !== newStyled[y][x]) {
                    // Update raw buffer
                    this.styledBuffer[y][x] = newStyled[y][x];
                    this.styledBuffer[y][x] = newStyled[y][x];

                    // Move cursor and add styled character
                    updates += `\x1b[${y + 1};${x + 1}H${newStyled[y][x]}`;
                }
            }
        }
        if (updates.length==0){
            return
        }
        // Write all updates at once
        await this.print(updates);
    }

    private async print(str: string) {
        const bytes = new TextEncoder().encode(str);
        await Deno.stdout.write(bytes);
    }

    async clear() {
        // Clear screen and reset buffers
        this.styledBuffer = Array.from({ length: this.world_size.y }, () => Array(this.world_size.x).fill(" "));
        await this.print("\x1b[?25l") // hide cursor
        await this.print("\x1b[H\x1b[J");
        // for(const row of this.rawBuffer){
        //     for(const col of row){
        //         await this.print(".");
        //     }
        //     await this.print("\n");
        // }
    }
}
