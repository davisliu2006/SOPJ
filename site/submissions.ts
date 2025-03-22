import express from "express";
import * as globals from "./globals";
import * as database from "../database/database";

export async function submissions(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let submissions: any;
        let conn = await globals.pool.getConnection();
        globals.dbSetup.initSubmissions(conn);
        let rows = await conn.query("SELECT id, problem, user, language FROM submissions;");
        submissions = rows;
        for (let submission of submissions) {
            let otherInfo: any[][] = [
                await conn.query("SELECT name FROM problems WHERE id = ?;", [submission.problem]),
                await conn.query("SELECT username FROM users WHERE id = ?;", [submission.user])
            ];
            submission.problemName = otherInfo[0][0].name;
            submission.userName = otherInfo[1][0].username;
        }
        conn.release();
        res.render("submissions.ejs", {user, submissions});
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
        let rows = await conn.query("SELECT id, problem, user, language, code, status FROM submissions WHERE id = ?;", [submissionID]);
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