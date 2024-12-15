import { createHotReloadMiddleware } from "./hot_reload.ts";

const hrm = createHotReloadMiddleware("./index.html")

async function server(request: Request): Promise<Response> {

    // HOT RELOAD MIDDLEWARE
    const hrm_response = await hrm(request);
    if (hrm_response) return hrm_response;

    if (request.method === "POST") {

    }

    const match = (new URLPattern({ pathname: "/state/:step" })).exec(request.url);
    if (match) {
        const step = match.pathname.groups.step;
        return new Response(`Step ${step}`);
    }

    // Serve the HTML file with the injected HMR client script
    return new Response(
        await Deno.readTextFile("./index.html"),
        {
            headers: {
                "content-type": "text/html; charset=utf-8",
                // "cache-control": "no-cache, no-store, must-revalidate",
                // "pragma": "no-cache",
                // "expires": "0",
            },
        },
    );
}

Deno.serve(server);

const input = `########
#..O.O.#
##@.O..#
#...O..#
#.#.O..#
#...O..#
#......#
########

<^^>>>vv<v>>v<<
`;

let [room_txt, moves_txt] = input.trim().split("\n\n");
const moves = moves_txt.replace("\n", "").split("").map(direction => {
    switch (direction) {
        case ">":
            return { x: 1, y: 0 };
        case "<":
            return { x: -1, y: 0 };
        case "^":
            return { x: 0, y: -1 };
        case "v":
            return { x: 0, y: 1 };
    }
});
const room = room_txt.split("\n").flatMap((row_text, y)=>row_text.split("").flatMap((cell, x)=>{
    switch(cell){
        case "#":
            return [{type:"wall", pos:{y, x}}];
        case "O":
            return [{type:"box", pos:{y, x}}];
        case "@":
            return [{type:"robot", pos:{y, x}}];
        default:
            return []
    }
}))
console.log(room)