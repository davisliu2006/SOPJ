export let tagCategories: Array<[string, Array<string>]> = [
    ["software", ["software"]],
    ["ai", ["machine learning", "neural network"]],
    ["backend", ["backend", "back-end", "back end"]],
    ["embedded", ["embedded", "firmware"]],
    ["frontend", ["frontend", "front-end", "front end"]],
    ["full-stack", ["fullstack", "full-stack", "full stack"]],
    ["system", ["operating system"]],
    ["web", ["web", "web-dev"]],
    ["c++", ["c++"]],
    ["c#", ["c#", ".net"]],
    ["java", ["java"]],
    ["javascript", ["javascript", "typescript"]],
    ["python", ["python"]]
]

export class JobInfo {
    title: string = "";
    url: string = "";
    classification: Array<string> = [];
    posTitle: string = "";
    location: string = "";
    compensation: string = "";
    description: string = "";

    public constructor(title: string = "", url: string = "", classification: Array<string> = []) {
        this.title = title;
        this.url = url;
        this.classification = classification;
    }
}

export class JobData {
    jobsFound: Array<JobInfo> = [];

    constructor(jobsFound: Array<JobInfo> = []) {
        this.jobsFound = jobsFound;
    }
}

export class DomainInfo {
    url: string = "";
    title: string = "";
    location: string = "";
    compensation: string = "";
    description: string = "";

    constructor() {}
}