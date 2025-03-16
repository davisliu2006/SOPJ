import express from "express";
import * as globals from "./globals";
import * as database from "../database/database";

export async function problems_create(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        if (!user) {
            res.redirect("/login");
            return;
        }

        let validate = globals.validateUser(user);
        if (!validate) {
            res.redirect("/logout");
            return;
        }

        res.render("problems-create.ejs", {user});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}

export async function create_problem(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let name = (req.body["name"]? req.body["name"] : "");
        let description = (req.body["description"]? req.body["description"] : "");
        if (!user) {
            res.redirect("/login");
            return;
        }

        let validate = globals.validateUser(user);
        if (!validate) {
            res.redirect("/logout");
            return;
        }

        let conn = await globals.pool.getConnection();
        let query = await conn.query(
            "INSERT INTO problems (name, description) VALUES (?, ?);",
            [name, description]
        );
        conn.release();
        let id = Number(query.insertId);

        res.redirect("/problems-view?id="+id);
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}

export async function problems_edit(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let id = (req.query["id"]? req.query["id"] : "");
        if (!user) {
            res.redirect("/login");
            return;
        }
        if (id == "") {
            res.redirect("/");
            return;
        }

        let validate = globals.validateUser(user);
        if (!validate) {
            res.redirect("/logout");
            return;
        }

        let conn = await globals.pool.getConnection();
        let rows = await conn.query("SELECT id, name, description FROM problems WHERE id = ?", [id]);
        conn.release();
        let problem = rows[0];

        res.render("problems-edit.ejs", {user, problem});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}