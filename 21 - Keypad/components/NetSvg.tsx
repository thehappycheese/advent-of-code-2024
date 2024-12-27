import { Vector2 } from "../util/Vector2.ts";


export function NetSvg(top_left: Vector2, bottom_right: Vector2, children: string) {
    const size = Vector2.sub(bottom_right, top_left);

    // Arrowhead size parameters
    const arrowLength = 12; // Length of the arrowhead
    const arrowWidth = 4; // Half the width of the arrowhead

    // Compute path based on arrowLength and arrowWidth
    const arrowPath = `M 0 0 L ${arrowLength} ${arrowWidth} L 0 ${arrowWidth * 2} z`;

    return `<svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="${top_left.x} ${top_left.y} ${bottom_right.x} ${bottom_right.y}"
            width="${size.x}"
            height="${size.y}"
            style="font-family:sans-serif;"
        >
        <defs>
            <marker
                id="arrow"
                viewBox="0 0 ${arrowLength} ${arrowWidth * 2}"
                refX="${arrowLength / 2}"
                refY="${arrowWidth}"
                markerWidth="${arrowLength / 2}"
                markerHeight="${arrowWidth}"
                orient="auto-start-reverse"
            >
                <path d="${arrowPath}" stroke="none" fill="context-stroke"/>
            </marker>
        </defs>
        ${children}
    </svg>`;
}
