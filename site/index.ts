import * as express from "express";

export function index(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("index.ejs", {user});
}

export function about(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("about.ejs", {user});
}