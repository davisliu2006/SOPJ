import Docker from "dockerode";
import * as fs from "fs";
import * as fsP from "fs/promises";
import * as globals from "./globals";
import * as checker from "./checker";
import * as verdicts from "./verdicts";

// language file names
const sourceFile = {
    "c": "main.c",
    "c++": "main.cpp",
    "java": "Main.java"
}
const binFile = {
    "c": "main",
    "c++": "main",
    "java": "Main.class"
}
const runFile = {
    "c": "main",
    "c++": "main",
    "java": "Main.class",
    "python": "main.py"
}

// setup docker
let docker = new Docker();

// compile code
export async function compile(language: string, code: string): Promise<[any | null, Buffer | null]> {
    if (!sourceFile[language]) {
        return [{StatusCode: 0}, Buffer.from(code)];
    }

    try {
        console.log("Compiling "+language+"...");

        // create bind directory
        let compileDir = `${globals.TMPDIR}/${globals.nextBindID()}`;
        globals.mkdirP(compileDir);
        await fsP.writeFile(compileDir+"/"+sourceFile[language], code);

        // execute code in docker container
        let [status, container]: [any, Docker.Container] = await docker.run(
            "online_judge_compiler", // docker image name
            [language], // command to run (language)
            process.stdout, // stream stdout to the host
            {
                HostConfig: {
                    Memory: 256*1024*1024, // memory limit (256 MB)
                    CpuPeriod: 100000, // cpu period
                    CpuQuota: 100000, // cpu quota (1 second)
                    NetworkMode: "none", // disable network access
                    // AutoRemove: true, // remove container after execution
                    Binds: [`${compileDir}:/home/judge/compile`], // mount input directory
                },
                WorkingDir: "/home/judge", // working directory in the container
            }
        );

        let output: Buffer;
        if (status.StatusCode == 0) {
            output = await fsP.readFile(compileDir+"/"+binFile[language]);
        } else {
            let logsStream = await container.logs({
                follow: false, // don't follow real time output
                stdout: true, // stdout
                stderr: true // stderr
            });
            output = logsStream; // convert logs to string
        }

        // remove bind directory
        fs.rmSync(compileDir, {recursive: true});

        container.remove();
        return [status, output];
    } catch (e) {
        console.log("Compile failed");
        console.error(e);
        return [null, null];
    }
}

// execute code
export async function execute(language: string, code: Buffer,
    input: string = ""
): Promise<[any | null, string | null]> {
    try {
        console.log("Running "+language+"...");

        // create bind directory
        let runDir = `${globals.TMPDIR}/${globals.nextBindID()}`;
        globals.mkdirP(runDir);
        await fsP.writeFile(runDir+"/"+runFile[language], code);
        await fsP.chmod(runDir+"/"+runFile[language], "775");
        await fsP.writeFile(runDir+"/input.in", input);
        await fsP.writeFile(runDir+"/output.out", "");

        // execute code in docker container
        let [status, container]: [any, Docker.Container] = await docker.run(
            "online_judge_runner", // docker image name
            [language], // command to run (language)
            process.stdout, // stream stdout to the host
            {
                HostConfig: {
                    Memory: 256*1024*1024, // memory limit (256 MB)
                    CpuPeriod: 100000, // cpu period
                    CpuQuota: 100000, // cpu quota (1 second)
                    NetworkMode: "none", // disable network access
                    // AutoRemove: true, // remove container after execution
                    Binds: [`${runDir}:/home/judge/run`], // mount input directory
                },
                WorkingDir: "/home/judge", // working directory in the container
            }
        );

        let output: string;
        if (status.StatusCode == 0) {
            output = (await fsP.readFile(runDir+"/output.out")).toString();
        } else {
            let logsStream = await container.logs({
                follow: false, // don't follow real time output
                stdout: true, // stdout
                stderr: true // stderr
            });
            output = logsStream.toString();; // convert logs to string
        }

        // remove bind directory
        fs.rmSync(runDir, {recursive: true});

        container.remove();
        return [status, output];
    } catch (e) {
        console.log("Judge failed");
        console.error(e);
        return [null, null];
    }
}

export async function judge(language: string, code: Buffer, expected: string,
    input: string = ""
): Promise<string> {
    let [status, output] = await execute(language, code, input);
    if (!status || !output) {
        return verdicts.IE;
    } else if (status.StatusCode == 0) {
        console.log("Expected: ["+expected+"]");
        let chk = checker.checker(output, expected);
        if (chk) {return verdicts.AC;}
        else {return verdicts.WA;}
    } else {
        return verdicts.RTE;
    }
}