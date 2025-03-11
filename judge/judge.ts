import * as Docker from "dockerode";
import * as checker from "./checker";

// setup docker
let docker = new Docker();

// execute code
export async function execute(language: string, code: string) {
    try {
        console.log("Judging "+language+"...");
        // execute code in docker container
        let [status, container]: [object, Docker.Container] = await docker.run(
            "online_judge", // docker image name
            [language, code], // command to run (language)
            process.stdout, // stream stdout to the host
            {
                HostConfig: {
                    Memory: 256*1024*1024, // memory limit (256 MB)
                    CpuPeriod: 100000, // cpu period
                    CpuQuota: 100000, // cpu quota (1 second)
                    NetworkMode: "none", // disable network access
                    AutoRemove: true, // remove container after execution
                },
                WorkingDir: "/home/judge", // working directory in the container
            }
        );

        console.log(status);
        let logsStream = await container.logs({
            follow: false, // don't follow real time output
            stdout: true, // stdout
            stderr: false // stderr
        });
        let output: string = logsStream.toString(); // convert logs to string
        console.log('Output:', output);
    } catch (e) {
        console.log("Judge failed");
        console.error(e);
    }
}