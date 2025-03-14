import * as env from "../include/env";
import * as fs from "fs";

export const DIR = env.DIR;

// make/remove directory
export function mkdirP(path: string) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }
}
export function rmdirP(path: string) {
    if (!fs.existsSync(path)) {
        fs.rmdirSync(path, {recursive: true});
    }
}

export let TMPDIR = DIR+"/../data/tmp";
mkdirP(TMPDIR);
export let dockerBindID = 0;
export function nextBindID() {
    return (++dockerBindID)%1000000007;
}