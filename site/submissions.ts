import * as dateFns from "date-fns";
import express from "express";
import * as globals from "./globals";
import * as database from "../database/database";

export async function submissions(req: express.Request, res: express.Response) {
    try {
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
        qParams.push(page*100);

        let submissions: Array<any> = [];
        let conn = await globals.pool.getConnection();
        await globals.dbSetup.initSubmissions(conn);
        let rows = await conn.query(
            `SELECT id, problem, user, language, status, points, totpoints, timestamp FROM submissions WHERE ${qString} ORDER BY id DESC LIMIT ?,100;`,
            qParams
        );
        submissions = rows;
        for (let submission of submissions) {
            let otherInfo: any[][] = [
                await conn.query("SELECT name FROM problems WHERE id = ?;", [submission.problem]),
                await conn.query("SELECT username FROM users WHERE id = ?;", [submission.user])
            ];
            submission.problemName = otherInfo[0][0].name;
            submission.userName = otherInfo[1][0].username;
            submission.timestampStr = dateFns.format(submission.timestamp, "yyyy-MM-dd HH:mm");
        }
        conn.release();
        res.render("submissions.ejs", {user, submissions, reqQuery: req.query});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}

export async function submissions_view(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let submissionID = Number(req.query["id"]? req.query["id"] : "");
        let submission: any;
        let conn = await globals.pool.getConnection();
        let rows = await conn.query("SELECT id, problem, user, language, code, status, points, totpoints FROM submissions WHERE id = ?;", [submissionID]);
        submission = rows[0];
        let otherInfo: any[][] = [
            await conn.query("SELECT name FROM problems WHERE id = ?;", [submission.problem]),
            await conn.query("SELECT username FROM users WHERE id = ?;", [submission.user])
        ];
        submission.problemName = otherInfo[0][0].name;
        submission.userName = otherInfo[1][0].username;
        conn.release();
        submission.json = await database.submissions.read(submissionID);
        res.render("submissions-view.ejs", {user, submission});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}