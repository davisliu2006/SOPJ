export class SubtaskJSON {
    name: string = "Subtask 0";
    points: number = 1;
    tests: Array<string> = [];
}

export class ProblemJSON {
    id: number = 0;
    subtasks: Array<SubtaskJSON> = [];
}