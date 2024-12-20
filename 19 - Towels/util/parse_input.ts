
export const parse_input = (input: string) => {
    let [a, b] = input.trim().split("\n\n");
    let sources = a.split(", ");
    let patterns = b.split("\n");
    return { sources, patterns };
};
