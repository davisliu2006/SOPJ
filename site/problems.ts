import express from "express";
import * as globals from "./globals";
import * as database from "../database/database";
import * as judge from "../judge/judge";

export async function problems(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let problems: Array<any> = [];
        let conn = await globals.pool.getConnection();
        globals.dbSetup.initProblems(conn);
        let rows = await conn.query("SELECT id, name, points FROM problems ORDER BY name;");
        conn.release();
        problems = rows;
        res.render("problems.ejs", {user, problems});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}

export async function problems_view(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let problemID = (req.query["id"]? req.query["id"] : "");
        let problem: any;
        let conn = await globals.pool.getConnection();
        let rows = await conn.query("SELECT id, name, points, description FROM problems WHERE id = ?;", [problemID]);
        conn.release();
        problem = rows[0];
        problem.description = await globals.mdToHTML(problem.description); // SECURITY IMPORTANCE
        res.render("problems-view.ejs", {user, problem});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}

export async function problems_submit(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        if (!user) {
            res.redirect("/login");
        }

        let problemID = (req.query["id"]? req.query["id"] : "");
        let problem: any;
        let conn = await globals.pool.getConnection();
        let rows = await conn.query("SELECT id, name FROM problems WHERE id = ?;", [problemID]);
        conn.release();
        problem = rows[0];
        res.render("problems-submit.ejs", {user, problem});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}

export async function submit_request(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        if (!user) {
            res.redirect("/login");
        }

        let problem = (req.body["problem"]? req.body["problem"] : "");
        let code = (req.body["code"]? req.body["code"] : "");
        let lang = (req.body["language"]? req.body["language"] : "");
        console.log(code);

        let conn = await globals.pool.getConnection();
        globals.dbSetup.initUsers(conn);
        let query = await conn.query(
            "INSERT INTO submissions (problem, user, language, code, status) VALUES (?, ?, ?, ?, ?);",
            [problem, user.userid, lang, code, "queuing"]
        );
        conn.release();
        let id = Number(query.insertId);

        if (globals.ISDEPLOY) {
            lang = "cpp";
            let config: database.ProblemJSON = await database.problems.readConfig(problem);
            for (let subtask of config.subtasks) {
                subtask.verdict = [];
                for (let test of subtask.tests) {
                    subtask.verdict.push("Q");
                }
            }
            database.submissions.write(id, config);
            res.redirect(`/submissions-view?id=${id}`);
            let points = 0;
            let totPoints = 0;
            for (let subtask of config.subtasks) {
                subtask.verdict = [];
                for (let test of subtask.tests) {
                    let input = await database.problems.readTest(problem, test+".in");
                    let expected = await database.problems.readTest(problem, test+".out");
                    let verdict = await judge.judge(lang, code, expected, input);
                    subtask.verdict.push(verdict);
                }
            }
            database.submissions.write(id, config);
        } else {
            let config: database.ProblemJSON = await database.problems.readConfig(problem);
            for (let subtask of config.subtasks) {
                subtask.verdict = [];
                for (let test of subtask.tests) {
                    subtask.verdict.push("IE");
                }
            }
            database.submissions.write(id, config);
            res.redirect(`/submissions-view?id=${id}`);
        }
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}