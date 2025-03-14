import express from "express";
import * as globals from "./globals";

export async function users(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let users: Array<any> = [];
        let conn = await globals.pool.getConnection();
        globals.dbSetup.initUsers(conn);
        let rows = await conn.query("SELECT id, username, points FROM users;");
        conn.release();
        users = rows;
        res.render("users.ejs", {user, users});
    } catch {
        res.redirect("/error-500");
    }
}

export async function users_view(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let userID = (req.query["id"]? req.query["id"] : "");
        let conn = await globals.pool.getConnection();
        let rows = await conn.query("SELECT id, username, points FROM users WHERE id = ?;", [userID]);
        conn.release();
        let userV = rows[0];
        res.render("users-view.ejs", {user, userV});
    } catch {
        res.redirect("/error-500");
    }
}