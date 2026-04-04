import {VerdictInfo} from "../judge/interfaces";

export interface SubtaskJSON {
    name: string;
    points: number;
    tests: Array<string>;
    verdict?: Array<string>;
    info?: Array<VerdictInfo>;
}
export namespace SubtaskJSON {
    export function createDefault(): SubtaskJSON {
        return {
            name: "Subtask 0",
            points: 1,
            tests: []
        };
    }
    export function validate(obj: any): SubtaskJSON | null {
        if (!obj) {return null;}
        if (typeof(obj.name) != "string") {return null;}
        if (typeof(obj.points) != "number") {return null;}
        if (!Array.isArray(obj.tests)) {return null;}
        for (let test of obj.tests) {
            if (typeof(test) != "string") {return null;}
        }
        if (obj.verdict) {
            if (!Array.isArray(obj.verdict)) {return null;}
            for (let verdict of obj.verdict) {
                if (typeof(verdict) != "string") {return null;}
            }
        }
        if (obj.info) {
            if (!Array.isArray(obj.info)) {return null;}
        }
        return obj;
    }
}

export interface ProblemJSON {
    subtasks: Array<SubtaskJSON>;
}
export namespace ProblemJSON {
    export function createDefault(): ProblemJSON {
        return {
            subtasks: []
        };
    }
    export function validate(obj: any): ProblemJSON | null {
        if (!obj) {return null;}
        if (!Array.isArray(obj.subtasks)) {return null;}
        for (let subtask of obj.subtasks) {
            if (!SubtaskJSON.validate(subtask)) {return null;}
        }
        return obj;
    }
}