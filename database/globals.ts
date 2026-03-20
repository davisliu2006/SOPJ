import * as fs from "fs";
import * as env from "../include/env";

export const DIR = env.DIR;
export const DB_DIR = DIR+"/../data";

/**
 * Makes a directory if it does not exist.
 */
export function mkdirP(path: string) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }
}