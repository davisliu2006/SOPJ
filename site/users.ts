import express from "express";
import * as globals from "./globals";

export async function users(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let search = (typeof(req.query["search"]) == "string"? req.query["search"] : "");
        let sortBy = (req.query["sort-by"]? req.query["sort-by"] : "username");
        if (sortBy != "username" && sortBy != "points" && sortBy != "problems") {
            sortBy = "username";
        }
        let sortOrder = (req.query["sort-order"]? req.query["sort-order"] : "0");
        let users: Array<any> = [];
        let conn = await globals.pool.getConnection();
        await globals.dbSetup.initUsers(conn);
        let rows = await conn.query(
            `SELECT id, username, points FROM users WHERE username LIKE ?
                ORDER BY ${sortBy} ${(sortOrder == "1"? "DESC" : "ASC")};`,
            [`%${search}%`]
        );
        conn.release();
        users = rows;
        res.render("users.ejs", {user, users});
    } catch (e) {
        console.log(e);
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