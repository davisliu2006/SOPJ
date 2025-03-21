import AdmZip from "adm-zip";
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
        database.problems.create(id);
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
        let rows = await conn.query("SELECT id, name, description FROM problems WHERE id = ?;", [id]);
        conn.release();
        if (rows.length < 1) {
            res.redirect("/");
            return;
        }
        let problem = rows[0];
        problem.config = JSON.stringify(
            await database.problems.readConfig(Number(id)), null, 4
        );
        res.render("problems-edit.ejs", {user, problem});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}

export async function edit_problem(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        let id = (req.body["id"]? req.body["id"] : "");
        let name = (req.body["name"]? req.body["name"] : "");
        let description = (req.body["description"]? req.body["description"] : "");
        let config = req.body["config"];
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
        let rows = await conn.query("SELECT id, name, description FROM problems WHERE id = ?;", [id]);
        if (rows.length < 1) {
            conn.release();
            res.redirect("/");
            return;
        }
        await conn.query("UPDATE problems SET name = ?, description = ? WHERE id = ?", [name, description, id]);
        conn.release();

        // file upload
        if (req.file) {
            let zip = new AdmZip(req.file.buffer);
            let zipEntries = zip.getEntries();
            let validate = "";
            let st = new Set<string>();
            for (const entry of zipEntries) {
                let entryName = entry.name;
                if (!entry.isDirectory && entryName.endsWith(".in")) {
                    st.add(entryName.substring(0, entryName.length-3));
                } else if (!entry.isDirectory && entryName.endsWith(".out")) {
                    if (st.has(entryName.substring(0, entryName.length-4))) {
                        st.delete(entryName.substring(0, entryName.length-4));
                    } else {
                        validate = "Missing input files";
                        break;
                    }
                }
            }
            if (validate == "" && st.size != 0) {
                validate = "Missing output files";
            }
            if (validate == "") {
                await database.problems.clearTests(id);
                for (const entry of zipEntries) {
                    let entryName = entry.name;
                    if (!entry.isDirectory && (entryName.endsWith(".in") || entryName.endsWith(".out"))) {
                        await database.problems.writeTest(id, entryName, entry.getData().toString());
                    }
                }
            } else {
                console.log(validate);
            }
        }

        // config update
        if (config) {
            config = database.ProblemJSON.validate(JSON.parse(config));
            console.log(config);
            if (config) {
                database.problems.writeConfig(id, config);
            }
        }
        
        res.redirect("/problems-view?id="+id);
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}