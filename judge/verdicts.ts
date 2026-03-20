import {ObjectMap} from "./interfaces";

export const exitCode: Map<number,string> = new Map([
    [139, "Segmentation fault"],
    [137, "Terminated"],
    [136, "Arithmetic error"],
    [134, "Aborted"]
]);

export const Q = "Q";
export const IE = "IE";
export const CE = "CE";
export const TLE = "TLE";
export const AB = "AB";
export const RTE = "RTE";
export const WA = "WA";
export const AC = "AC";

export let priority: ObjectMap<number> = {
    Q: 10,
    IE: 9,
    CE: 8,
    AB: 7,
    RTE: 6,
    TLE: 5,
    WA: 4,
    AC: 3
}
/**
 * @returns the verdict with higher priority
 */
export function priorityVerdict(x: string, y: string): string {
    if (priority[x] >= priority[y]) {return x;}
    else {return y;}
}