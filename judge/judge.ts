import * as Docker from "dockerode";
import * as fs from "fs";
import * as path from "path";

// setup docker
let docker = new Docker();

// tmp directory for code
const TMPDIR = path.join("/tmp", "opj");

// execute code
export async function execute(language: string, code: string) {
    const FILENAME = path.join(TMPDIR, "main.cpp");
    try {
        // make file for code
        fs.mkdirSync(TMPDIR, {recursive: true});
        fs.writeFileSync(FILENAME, code, {flag: "w"});

        // execute code in docker container
        let [container, output]: [Docker.Container, Buffer] = await docker.run(
            "online-judge", // docker image name
            [language],     // command to run (language)
            process.stdout, // stream stdout to the host
            {
                HostConfig: {
                    Memory: 256*1024*1024, // memory limit (256 MB)
                    CpuPeriod: 100000,     // cpu period
                    CpuQuota: 100000,      // cpu quota (1 second)
                    NetworkMode: "none",   // disable network access
                    AutoRemove: true,      // remove container after execution
                },
                Volumes: {
                    [TMPDIR]: {}, // mount the temporary directory
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