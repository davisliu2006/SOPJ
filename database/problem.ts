export class SubtaskJSON {
    name: string = "Subtask 0";
    points: number = 1;
    tests: Array<string> = [];
    verdict: Array<string> | null = null;
}

export class ProblemJSON {
    subtasks: Array<SubtaskJSON> = [];

    static validate(obj: any): ProblemJSON | null {
        obj = obj as ProblemJSON;
        if (!obj) {return null;}
        obj.subtasks = obj.subtasks as Array<SubtaskJSON>;
        if (!obj.subtasks || !Array.isArray(obj.subtasks)) {return null;}
        for (let subtask of obj.subtasks) {
            if (typeof(subtask.name) != "string") {return null;}
            if (typeof(subtask.points) != "number") {return null;}
            if (!Array.isArray(subtask.tests)) {return null;}
        }
        return obj;
    }
}