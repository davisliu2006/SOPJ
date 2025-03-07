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

export function problems_submit(req: express.Request, res: express.Response) {
    let user = req.user;
    let read = fs.readFileSync(globals.DIR+"/../data/problems.json", "utf8");
    let problemData = JSON.parse(read);
    res.render("problems-submit.ejs", {user});
}