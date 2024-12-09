const input = (await Deno.readTextFile("input.txt")).trim();
//const input = "2333133121414131402"

// ======== TYPES ========
type File = {
    offset: number;
    size: number;
    id: number;
};
type Gap = Omit<File, "id">;

// ======== HELPERS ========
const enumerate = function* <T>(iter: Iterable<T>): Generator<[number, T]> {
    let offset = 0;
    for (const item of iter) {
        yield [offset, item];
        offset++;
    }
};
const chunks = function* <T>(arr: T[]): Generator<[T, T]> {
    for (let i = 1; i < arr.length; i += 2) {
        yield [arr[i - 1], arr[i]];
    }
};
const check_sum = ({ offset, size, id }: File) => {
    let result = 0;
    for (let i = 0; i < size; i++) {
        result += (offset + i) * id;
    }
    return result;
};

const disk_map = chunks(Array.from(input + "0").map(parseFloat));
const files: File[] = [];
const gaps: Gap[] = [];
let offset: number = 0;
const final_files = [];

for (const [id, [file_size, gap_size]] of enumerate(disk_map)) {
    files.push({
        offset,
        size: file_size,
        id,
    });
    if (gap_size > 0) {
        gaps.push({
            offset: offset + file_size,
            size: gap_size,
        });
    }
    offset += file_size + gap_size;
}

for (const file of files.toReversed()) {
    let not_moved_file = true;
    for (const gap of gaps) {
        if (gap.offset > file.offset) {
            break;
        }
        if (file.size <= gap.size) {
            final_files.push({
                ...file,
                offset: gap.offset,
            });
            gap.size -= file.size;
            gap.offset += file.size;
            not_moved_file = false;
            break;
        }
    }
    if (not_moved_file) {
        final_files.push(file);
    }
}

console.log(final_files.map(check_sum).reduce((a, b) => a + b));
