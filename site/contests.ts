import * as express from "express";

export function contests(req: express.Request, res: express.Response) {
    res.render("contests.ejs");
}