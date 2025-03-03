import * as express from "express";

export function login(req: express.Request, res: express.Response) {
    res.render("login.ejs");
};

export function signup(req: express.Request, res: express.Response) {
    res.render("signup.ejs");
};