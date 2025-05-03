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
        res.render("users.ejs", {user, users, reqQuery: req.query});
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
        let userV = rows[0];
        let submissions = await conn.query(
            "SELECT id, problem, status, points, totpoints FROM submissions WHERE user = ? AND points != 0 ORDER BY points;",
            [userID]
        );
        let solvedP: Array<any> = [];
        let st = new Set<number>();
        for (let submission of submissions) {
            let problem = (await conn.query(
                "SELECT id, name, points FROM problems WHERE id = ?;",
                [submission.problem])
            )[0];
            if (st.has(problem.id)) {continue;}
            st.add(problem.id);
            problem.ptsEarned = problem.points * submission.points/submission.totpoints;
            problem.verdict = submission.status;
            solvedP.push(problem);
        }
        solvedP.sort(function(x, y) {
            if (x.ptsEarned > y.ptsEarned) {return -1;}
            else if (x.ptsEarned < y.ptsEarned) {return 1;}
            else {return 0;}
        });
        conn.release();
        res.render("users-view.ejs", {user, userV, solvedP});
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}