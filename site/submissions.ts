import * as dateFns from "date-fns";
import express from "express";
import * as globals from "./globals";
import * as database from "../database/database";
import * as judge from "../judge/judge";
import * as validation from "./validation";
import {ProblemData, SQLSelectResult, SQLUpdateResult, SubmissionData, UserData} from "./interfaces";

/**
 * GET /submissions
 */
export async function submissions(req: express.Request, res: express.Response) {
    try {
        const PAGE_SIZE = 100;
        let user = req.user;
        let userFilter = req.query["user"];
        let problemFilter = req.query["problem"];
        let langFilter = req.query["language"];
        let statusFilter = req.query["status"];
        let page = (req.query["page"]? Number(req.query["page"]) : 0);
        let qString = "1 = 1";
        let qParams = [];
        if (userFilter) {
            qString += " AND user = ?";
            qParams.push(userFilter);
        }
        if (problemFilter) {
            qString += " AND problem = ?";
            qParams.push(problemFilter);
        }
        if (langFilter) {
            qString += " AND language = ?";
            qParams.push(langFilter);
        }
        if (statusFilter) {
            qString += " AND status = ?";
            qParams.push(statusFilter);
        }

        let submissions: Array<SubmissionData> = [];
        let conn = await globals.pool.getConnection();
        await globals.dbSetup.initSubmissions(conn);
        let rowCount = (await conn.query<SQLSelectResult<{cnt: number}>>(
            `SELECT COUNT(*) AS cnt FROM submissions WHERE ${qString};`,
            qParams
        ))[0].cnt;
        let pageCount = Math.ceil(Number(rowCount)/PAGE_SIZE);
        let rows = await conn.query<SQLSelectResult<SubmissionData>>(
            `SELECT id, problem, user, language, status, points, totpoints, timestamp FROM submissions WHERE ${qString} ORDER BY id DESC LIMIT ?,${PAGE_SIZE};`,
            [...qParams, page*PAGE_SIZE]
        );
        submissions = rows;
        for (let submission of submissions) {
            let problemData = (await conn.query<SQLSelectResult<ProblemData>>(
                "SELECT name FROM problems WHERE id = ?;", [submission.problem]
            ))[0];
            let userData = (await conn.query<SQLSelectResult<UserData>>(
                "SELECT username FROM users WHERE id = ?;", [submission.user]
            ))[0];
            submission.problemName = problemData.name;
            submission.userName = userData.username;
            submission.timestampStr = dateFns.format(submission.timestamp!, "yyyy-MM-dd HH:mm");
        }
        conn.release();
        res.render("submissions.ejs", {
            user, submissions, reqQuery: req.query, pageCount
        });
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}

/**
 * GET /submissions-view
 */
export async function submissions_view(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let submissionID = Number(req.query["id"]? req.query["id"] : "");
        let submission: SubmissionData;
        let conn = await globals.pool.getConnection();
        let rows = await conn.query<SQLSelectResult<SubmissionData>>(
            "SELECT id, problem, user, language, code, status, points, totpoints FROM submissions WHERE id = ?;", [submissionID]
        );
        submission = rows[0];
        let problemData = (await conn.query<SQLSelectResult<ProblemData>>(
            "SELECT name FROM problems WHERE id = ?;", [submission.problem]
        ))[0];
        let userData = (await conn.query<SQLSelectResult<UserData>>(
            "SELECT username FROM users WHERE id = ?;", [submission.user]
        ))[0];
        submission.problemName = problemData.name;
        submission.userName = userData.username;
        conn.release();
        submission.json = await database.submissions.read(submissionID);
        res.render("submissions-view.ejs", {user, submission});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}

/**
 * POST /regrade-request
 */
export async function regrade_request(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        if (!user) {
            res.redirect("/login");
            return;
        }
        let validate = await globals.validateUser(user);
        if (validate != 10) {
            res.redirect("/permission-denied");
            return;
        }

        let id = Number(req.query["id"]? req.query["id"] : "0");
        let conn = await globals.pool.getConnection();
        let submission = (await conn.query<SQLSelectResult<SubmissionData>>(
            "SELECT problem, user, language, code FROM submissions WHERE id = ?;",
            [id]
        ))[0];
        let problem = submission.problem;
        let code = submission.code;
        let lang = submission.language;

        await conn.query<SQLUpdateResult>(
            "UPDATE submissions SET status = ? WHERE id = ?;",
            [judge.verdicts.Q, id]
        );
        conn.release();

        if (globals.JUDGE_SUPPORT) {
            let config: database.ProblemJSON = await database.problems.readConfig(problem!);
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
            let [cStatus, compile] = await judge.compile(lang!, code!);
            console.log(cStatus);
            if (cStatus!.StatusCode == 0) {
                let currVerdict = judge.verdicts.AC;
                for (let subtask of config.subtasks) {
                    let subtaskPass = 1;
                    let vi = 0;
                    for (let test of subtask.tests) {
                        let input = await database.problems.readTest(problem!, test+".in");
                        let expected = await database.problems.readTest(problem!, test+".out");
                        let [verdict, info] = await judge.judge(lang!, compile!, expected, input);
                        subtask.verdict![vi] = verdict;
                        subtask.info![vi++] = info;
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
                await conn.query<SQLUpdateResult>(
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
                await conn.query<SQLUpdateResult>(
                    "UPDATE submissions SET points = ?, totpoints = ?, status = ? WHERE id = ?;",
                    [points, totPoints, judge.verdicts.CE, id]
                );
            }
            database.submissions.write(id, config);

            // update user points
            validation.validateUserPoints(submission.user!);
        } else {
            let config: database.ProblemJSON = await database.problems.readConfig(problem!);
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