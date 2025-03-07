import * as express from "express";

export function contests(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("contests.ejs", {user});
}