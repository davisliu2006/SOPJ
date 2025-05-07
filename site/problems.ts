import express from "express";
import * as globals from "./globals";
import * as database from "../database/database";
import * as judge from "../judge/judge";

export async function problems(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let problems: Array<any> = [];
        let search = (typeof(req.query["search"]) == "string"? req.query["search"] : "");
        let ptsMin = (req.query["pts-min"]? req.query["pts-min"] : "0");
        let ptsMax = (req.query["pts-max"]? req.query["pts-max"] : "100");
        let sortBy = (req.query["sort-by"]? req.query["sort-by"] : "name");
        if (sortBy != "name" && sortBy != "points" && sortBy != "submissions") {
            sortBy = "name";
        }
        let sortOrder = (req.query["sort-order"]? req.query["sort-order"] : "0");
        let conn = await globals.pool.getConnection();
        await globals.dbSetup.initProblems(conn);
        let rows = await conn.query(
            `SELECT id, name, points FROM problems WHERE ? <= points AND points <= ? AND name LIKE ?
                ORDER BY ${sortBy} ${(sortOrder == "1"? "DESC" : "ASC")};`,
            [ptsMin, ptsMax, `%${search}%`]
        );
        conn.release();
        problems = rows;
        res.render("problems.ejs", {user, problems, reqQuery: req.query});
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
        let rows = await conn.query("SELECT id, name, points, description, time, memory FROM problems WHERE id = ?;", [problemID]);
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
            res.redirect(`/login?redirect=${req.originalUrl}`);
            return;
        }
        let validate = await globals.validateUser(user);
        if (validate == 0) {
            res.redirect("/logout");
            return;
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
            return;
        }
        let validate = await globals.validateUser(user);
        if (validate == 0) {
            res.redirect("/logout");
            return;
        }

        let problem = (req.body["problem"]? req.body["problem"] : "");
        let code = (req.body["code"]? req.body["code"] : "");
        let lang = (req.body["language"]? req.body["language"] : "");
        console.log(code);

        let conn = await globals.pool.getConnection();
        await globals.dbSetup.initUsers(conn);
        let query = await conn.query(
            "INSERT INTO submissions (problem, user, language, code, status) VALUES (?, ?, ?, ?, ?);",
            [problem, user.userid, lang, code, judge.verdicts.Q]
        );
        conn.release();
        let id = Number(query.insertId);

        if (globals.JUDGE_SUPPORT) {
            let config: database.ProblemJSON = await database.problems.readConfig(problem);
            for (let subtask of config.subtasks) {
                subtask.verdict = [];
                subtask.info = [];
                for (let test of subtask.tests) {
                    subtask.verdict.push(judge.verdicts.Q);
                    subtask.info.push({});
                }
            }
            database.submissions.write(id, config);
            res.redirect(`/submissions-view?id=${id}`);
            let points = 0;
            let totPoints = 0;
            let [cStatus, compile] = await judge.compile(lang, code);
            console.log(cStatus);
            if (cStatus.StatusCode == 0) {
                let currVerdict = judge.verdicts.AC;
                for (let subtask of config.subtasks) {
                    let subtaskPass = 1;
                    let vi = 0;
                    for (let test of subtask.tests) {
                        let input = await database.problems.readTest(problem, test+".in");
                        let expected = await database.problems.readTest(problem, test+".out");
                        let [verdict, info] = await judge.judge(lang, compile, expected, input);
                        subtask.verdict[vi] = verdict;
                        subtask.info[vi++] = info;
                        currVerdict = judge.verdicts.priorityVerdict(currVerdict, verdict);
                        if (verdict != judge.verdicts.AC) {
                            subtaskPass = 0;
                            // break;
                        }
                    }
                    totPoints += subtask.points;
                    points += subtask.points*subtaskPass;
                    database.submissions.write(id, config);
                }
                await conn.query(
                    "UPDATE submissions SET points = ?, totpoints = ?, status = ? WHERE id = ?;",
                    [points, totPoints, currVerdict, id]
                );
            } else {
                for (let subtask of config.subtasks) {
                    subtask.verdict = [];
                    for (let test of subtask.tests) {
                        subtask.verdict.push(judge.verdicts.CE);
                    }
                    totPoints += subtask.points;
                }
                await conn.query(
                    "UPDATE submissions SET points = ?, totpoints = ?, status = ? WHERE id = ?;",
                    [points, totPoints, judge.verdicts.CE, id]
                );
            }
            database.submissions.write(id, config);

            // update user points
        } else {
            let config: database.ProblemJSON = await database.problems.readConfig(problem);
            for (let subtask of config.subtasks) {
                subtask.verdict = [];
                for (let test of subtask.tests) {
                    subtask.verdict.push(judge.verdicts.IE);
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