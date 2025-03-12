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
        conn.release();
        submissions = rows;
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
        conn.release();
        submission = rows[0];
        if (submission.status != "queuing") {
            submission.json = await database.submissions.read(submissionID);
        }
        res.render("submissions-view.ejs", {user, submission});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}