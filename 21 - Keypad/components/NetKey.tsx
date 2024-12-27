import { Vector2 } from "../util/Vector2.ts";
import { escape_html } from "./escape_html.tsx";

export function NetKey({pos,size,label,key, color="#333"}:{pos:Vector2, size:Vector2, label:string, key:string, color?:string}){
    return `<g transform="translate(${pos.x} ${pos.y})" class="Key">
        <rect
            style="fill:${color};stroke:none;"
            width="${size.x}"
            height="${size.y}"
            x="${-size.x/2}"
            y="${-size.y/2}"
            rx="${size.x/5}"
        />
        <text
            style="font-size:0.8em;"
            y="${-size.y/2}"
            text-anchor="middle"
            dominant-baseline="text-bottom"
        >${escape_html(label)}</text>
        <text
            style="font-size:0.8em;"
            fill="white"
            text-anchor="middle"
            dominant-baseline="central"
        >${escape_html(key)}</text>
    </g>`
}