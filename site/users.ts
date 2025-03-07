import * as express from "express";
import * as fs from "fs";
import * as globals from "./globals";

export function users(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let read = fs.readFileSync(globals.DIR+"/../data/users.json", "utf8");
        let userData = JSON.parse(read);
        res.render("users.ejs", {user, userData});
    } catch {
        res.render("505.ejs");
    }
}