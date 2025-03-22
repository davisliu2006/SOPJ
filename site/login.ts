import * as bcrypt from "bcrypt";
import express from "express";
import * as jwt from "jsonwebtoken";
import * as globals from "./globals";

export function login(req: express.Request, res: express.Response) {
    let user = req.user;
    let errors = (req.query["error"]? req.query["error"] : "");
    res.render("login.ejs", {user, errors});
};
export async function login_request(req: express.Request, res: express.Response) {
    try {
        let errors = "";
        let username = (typeof(req.body["username"]) == "string"? req.body["username"] : "");
        let password = (typeof(req.body["password"]) == "string"? req.body["password"] : "");

        // CAPTCHA
        let captcha = (typeof(req.body["captcha"]) == "string"? req.body["captcha"] : "");
        if (captcha != req.session.captcha) {
            console.log("CAPTCHA: got ["+captcha+"] expected ["+req.session.captcha+"]");
            errors = "CAPTCHA failed";
            res.redirect("/login?error="+encodeURIComponent(errors));
            return;
        } else {
            console.log("CAPTCHA verification successful!");
        }

        let conn = await globals.pool.getConnection();
        globals.dbSetup.initUsers(conn);
        let rows = await conn.query("SELECT id, username, password FROM users WHERE username = ?;", [username]);
        if (rows.length == 0) {
            conn.release();
            errors = "Account does not exist";
            res.redirect("/login?error="+encodeURIComponent(errors));
            return;
        }

        let user = rows[0];
        if (!bcrypt.compareSync(password, user.password)) {
            conn.release();
            errors = "Incorrect password";
            res.redirect("/login?error="+encodeURIComponent(errors));
            return;
        }

        conn.release();
        let cookieToken = jwt.sign({
            userid: user.id, username: user.username
        }, globals.JWTSECRET);
        res.cookie("opj", cookieToken, {
            httpOnly: true, secure: true, sameSite: "strict",
            maxAge: 1000*3600*24
        });
        res.redirect("/");
    } catch (e) {
        console.log(e);
        res.redirect("/error-500");
    }
}

export function signup(req: express.Request, res: express.Response) {
    let user = req.user;
    let errors = (req.query["error"]? req.query["error"] : "");
    res.render("signup.ejs", {user, errors});
};
export async function signup_request(req: express.Request, res: express.Response) {
    function validateUsername(str: string): string {
        if (str.length < 1 || str.length > 20) {
            return "Username must be between 1 and 20 characters";
        }
        if (!/[a-zA-Z0-9]+/.test(str)) {
            return "Username can only contain alphanumeric characters";
        }
        return "";
    }
    function validatePassword(str: string): string {
        if (str.length < 6 || str.length > 20) {
            return "Password must be between 6 and 20 characters";
        }
        return "";
    }

    try {
        let errors = "";
        let username = (typeof(req.body["username"]) == "string"? req.body["username"] : "");
        let password = (typeof(req.body["password"]) == "string"? req.body["password"] : "");
        let confirm = (typeof(req.body["conf-password"]) == "string"? req.body["conf-password"] : "");

        // CAPTCHA
        let captcha = (typeof(req.body["captcha"]) == "string"? req.body["captcha"] : "");
        if (captcha != req.session.captcha) {
            console.log("CAPTCHA: got ["+captcha+"] expected ["+req.session.captcha+"]");
            errors = "CAPTCHA failed";
            res.redirect("/signup?error="+encodeURIComponent(errors));
            return;
        } else {
            console.log("CAPTCHA verification successful!");
        }

        let vUsername = validateUsername(username);
        if (vUsername != "") {
            errors = vUsername;
            res.redirect("/signup?error="+encodeURIComponent(errors));
            return;
        }
        
        let conn = await globals.pool.getConnection();
        globals.dbSetup.initUsers(conn);
        let rows = await conn.query("SELECT id, username, password FROM users WHERE username = ?;", [username]);
        if (rows.length != 0) {
            conn.release();
            errors = "User already exists";
            res.redirect("/signup?error="+encodeURIComponent(errors));
            return;
        }

        let vPassword = validatePassword(password);
        if (vPassword != "") {
            conn.release();
            errors = vPassword;
            res.redirect("/signup?error="+encodeURIComponent(errors));
            return;
        }
        if (password != confirm) {
            conn.release();
            errors = "Passwords do not match";
            res.redirect("/signup?error="+encodeURIComponent(errors));
            return;
        }

        let hashed = bcrypt.hashSync(password, 8);
        await conn.query("INSERT INTO users (username, password) VALUES (?, ?);", [username, hashed]);
        conn.release();
        res.redirect("/login");
    } catch (e) {
        console.log(e)
        res.redirect("/error-500");
    }
};

export function logout(req: express.Request, res: express.Response) {
    res.clearCookie("opj");
    res.redirect("/");
}

export function account(req: express.Request, res: express.Response) {
    try {
        let user = req.user;
        if (!user) {
            res.redirect("/login");
            return;
        }

        res.render("account.ejs", {user});
    } catch (e) {
        console.log(e)
        res.redirect("/error-500");
    }
}