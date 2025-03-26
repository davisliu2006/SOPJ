import express from "express";

export function index(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("index.ejs", {user});
}

export function about(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("about.ejs", {user});
}

export function terms(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("terms.ejs", {user});
}