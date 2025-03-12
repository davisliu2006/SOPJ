import * as fs from "fs";
import * as fsP from "fs/promises";
import * as globals from "./globals";
import {ProblemJSON, SubtaskJSON} from "./problem";

export function exists(path: string): boolean {
    return fs.existsSync(globals.DB_DIR+"/"+path);
}
export function mkdirP(path: string) {
    globals.mkdirP(globals.DB_DIR+"/"+path);
}
export function rmdir(path: string) {
    fs.rmSync(path, {recursive: true});
}
export async function listDir(path: string): Promise<Array<string>> {
    return fsP.readdir(globals.DB_DIR+"/"+path);
}
export async function readData(path: string): Promise<string> {
    return (await fsP.readFile(globals.DB_DIR+"/"+path)).toString();
}
export async function writeData(path: string, data: string) {
    fsP.writeFile(globals.DB_DIR+"/"+path, data, {flag: "w"});
}

// problems
export namespace problems {
    export function create(id: number) {
        mkdirP(`problems/${id}`);
        writeData(`problems/${id}/config.json`, JSON.stringify(new ProblemJSON()));
    }
    export async function readConfig(id: number): Promise<object> {
        return JSON.parse(await readData(`problems/${id}/config.json`));
    }
    export async function writeConfig(id: number, data: object) {
        writeData(`problms/${id}/config.json`, JSON.stringify(data));
    }
    export async function readTest(id: number, testName: string): Promise<string> {
        return readData(`/problems/${id}/${testName}`);
    }
    export async function writeTest(id: number, testName: string, data: string) {
        writeData(`/problems/${id}/${testName}`, data);
    }
    export async function getTests(id: number): Promise<Array<string>> {
        let contents = await listDir(`/problems/${id}`);
        let val: Array<string> = [];
        for (let path of contents) {
            if (path.endsWith(".in") || path.endsWith(".out")) {
                val.push(path);
            }
        }
        return val;
    }
    export async function clearTests(id: number) {
        let tests = await getTests(id);
        for (let path of tests) {
            fs.rmSync(path);
        }
    }
}