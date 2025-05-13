import express from "express";
import * as globals from "./globals";

export async function index(req: express.Request, res: express.Response) {
    let user = req.user;
    let conn = await globals.pool.getConnection();

    // popular problems
    globals.dbSetup.initSubmissions(conn);
    let submissions = await conn.query(`SELECT id, problem FROM submissions ORDER BY id DESC LIMIT 100;`);
    let freq = new Map<number,number>();
    for (let submission of submissions) {
        if (!freq.has(submission.problem)) {
            freq.set(submission.problem, 1);
        } else {
            freq.set(submission.problem, freq.get(submission.problem)+1);
        }
    }
    let sorted = [];
    for (let key of freq.keys()) {
        sorted.push(key);
    }
    sorted.sort(function(x, y) {
        if (freq.get(x) > freq.get(y)) {return -1;}
        else if (freq.get(x) < freq.get(y)) {return 1;}
        else {return 0;}
    });
    let popular = [];
    for (let id of sorted) {
        popular.push(
            (await conn.query("SELECT id, name FROM problems WHERE id = ?;", [id]))[0]
        );
    }

    conn.release();
    res.render("index.ejs", {user, popular});
}

export function about(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("about.ejs", {user});
}

export function terms(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("terms.ejs", {user});
}