export function split_by_words(str: string): Array<string> {
    return str.split(/[^a-zA-Z0-9]+/);
}
function is_space(c: string): boolean {
    return c == ' ' || c == '\n' || c == '\r';
}
export function prune_spaces(str: string): string {
    let val = " ";
    for (let c of str) {
        if (!is_space(c) || !is_space(val[val.length-1])) {
            val += c;
        }
    }
    return val.trim();
}