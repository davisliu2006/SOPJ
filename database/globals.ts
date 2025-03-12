import * as fs from "fs";
import * as env from "../include/env";

export const DIR = env.DIR;
export const DB_DIR = DIR+"/../data";

// make directory
export function mkdirP(path: string) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }
}