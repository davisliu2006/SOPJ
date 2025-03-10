import * as Docker from "dockerode";
import * as fs from "fs";
import * as path from "path";
import * as globals from "./globals";

// setup docker
let docker = new Docker();

// tmp directory for code
const TMPDIR = globals.DIR+"/../data/tmp";

// execute code
export async function execute(language: string, code: string) {
    const FILENAME = TMPDIR+"/main.cpp";
    try {
        // make file for code
        fs.mkdirSync(TMPDIR, {recursive: true});
        fs.writeFileSync(FILENAME, code, {flag: "w"});

        // execute code in docker container
        let [container, output]: [Docker.Container, Buffer] = await docker.run(
            "online_judge", // docker image name
            [language, code],     // command to run (language)
            process.stdout, // stream stdout to the host
            {
                HostConfig: {
                    Memory: 256*1024*1024, // memory limit (256 MB)
                    CpuPeriod: 100000,     // cpu period
                    CpuQuota: 100000,      // cpu quota (1 second)
                    NetworkMode: "none",   // disable network access
                    AutoRemove: true,      // remove container after execution
                },
                WorkingDir: "/home/judge", // working directory in the container
            }
        );

        console.log("Output:", output.toString());
    } catch (e) {
        console.log("Judge failed");
        console.error(e);
    } finally {
        try {
            fs.unlinkSync(FILENAME);
            fs.rmdirSync(TMPDIR);
        } catch (e) {
            console.log(e);
        }
    }
}