import express from "express";
import * as fs from "fs";
import * as globals from "./globals";

export async function users(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let users: Array<any> = [];
        let conn = await globals.pool.getConnection();
        globals.dbSetup.initUsers(conn);
        let rows = await conn.query("SELECT id, username, points FROM users;");
        conn.release();
        for (let row of rows) {
            users.push({
                username: row.username, points: row.points, problems: 0
            });
        }
        res.render("users.ejs", {user, users});
    } catch {
        res.redirect("/error-500");
    }
}