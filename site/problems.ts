import * as childProcess from "child_process";
import * as express from "express";
import * as fs from "fs";
import * as globals from "./globals";

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
        conn.release();
        await conn.query("INSERT INTO submissions (problem, user, language, code) VALUES (?, ?, ?, ?);", [problem, user.userid, lang, code]);

        if (globals.ISDEPLOY) {
            if (lang == "c++") {
                childProcess.exec("ls", function(err, stdout, stderr) {
                    console.log(err);
                    console.log(stdout);
                    console.log(stderr);
                });
            }
            res.send("Sent");
        } else {
            res.send("Cannot send");
        }
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}