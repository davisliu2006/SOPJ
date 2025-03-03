import * as express from "express";
import * as fs from "fs";
import * as globals from "./globals";

export function problems(req: express.Request, res: express.Response) {
    try {
        let read = fs.readFileSync(globals.DIR+"/../data/problems.json", "utf8");
        let problemData = JSON.parse(read);
        res.render("problems.ejs", {problemData});
    } catch {
        res.render("505.ejs");
    }
}

export function problems_view(req, res) {
    let read = fs.readFileSync(globals.DIR+"/../data/problems.json", "utf8");
    let problemData = JSON.parse(read);
    // let problem = problemData.problems[problemData.problems.find()];
    res.render("problems-view.ejs", {read});
}

export function problems_submit(req, res) {
    let read = fs.readFileSync(globals.DIR+"/../data/problems.json", "utf8");
    let problemData = JSON.parse(read);
    res.render("problems-submit.ejs", {});
}