export function escape_html(str: string): string {
    const htmlEntities: { [char: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;', // Optional: Escapes single quotes
    };

    return str.replace(/[<>&"']/g, (char) => htmlEntities[char]);
}