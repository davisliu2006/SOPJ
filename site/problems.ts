import * as express from "express";
import * as fs from "fs";
import * as globals from "./globals";

export function problems(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let read = fs.readFileSync(globals.DIR+"/../data/problems.json", "utf8");
        let problemData = JSON.parse(read);
        res.render("problems.ejs", {user, problemData});
    } catch {
        res.render("505.ejs");
    }
}

export function problems_view(req, res) {
    let user = req.user;
    let read = fs.readFileSync(globals.DIR+"/../data/problems.json", "utf8");
    let problemData = JSON.parse(read);
    // let problem = problemData.problems[problemData.problems.find()];
    res.render("problems-view.ejs", {user, read});
}

export function problems_submit(req, res) {
    let user = req.user;
    let read = fs.readFileSync(globals.DIR+"/../data/problems.json", "utf8");
    let problemData = JSON.parse(read);
    res.render("problems-submit.ejs", {user});
}