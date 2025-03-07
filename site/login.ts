import * as bcrypt from "bcrypt";
import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as globals from "./globals";

export function login(req: express.Request, res: express.Response) {
    let errors = "";
    res.render("login.ejs", {errors});
};
export async function login_request(req: express.Request, res: express.Response) {
    try {
        let errors = "";
        let username = (typeof(req.body["username"]) == "string"? req.body["username"] : "");
        let password = (typeof(req.body["password"]) == "string"? req.body["password"] : "");

        let conn = await globals.pool.getConnection();
        let rows = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length == 0) {
            conn.release();
            errors = "Account does not exist";
            res.render("login.ejs", {errors});
            return;
        }

        let user = rows[0];
        if (!bcrypt.compareSync(password, user.password)) {
            conn.release();
            errors = "Incorrect password";
            res.render("login.ejs", {errors});
            return;
        }

        conn.release();
        errors = "Logged in";
        let cookieToken = jwt.sign({
            userid: user.id
        }, globals.JWTSECRET);
        res.cookie("opj", cookieToken, {
            httpOnly: true, secure: true, sameSite: "strict",
            maxAge: 1000*3600*24
        });
        res.render("login.ejs", {errors});
    } catch (e) {
        console.log(e);
        res.render("500.ejs");
    }
}

export function signup(req: express.Request, res: express.Response) {
    let errors = "";
    res.render("signup.ejs", {errors});
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
        let confirm = (typeof(req.body["conf-password"]) == "string"? req.body["conf-password"] : "");;
        let vUsername = validateUsername(username);
        if (vUsername != "") {
            errors = vUsername;
            res.render("signup.ejs", {errors});
            return;
        }
        let vPassword = validatePassword(password);
        if (vPassword != "") {
            errors = vPassword;
            res.render("signup.ejs", {errors});
            return;
        }
        if (password != confirm) {
            errors = "Passwords do not match";
            res.render("signup.ejs", {errors});
            return;
        }
        
        let conn = await globals.pool.getConnection();
        let rows = await conn.query("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length != 0) {
            conn.release();
            errors = "User already exists";
            res.render("signup.ejs", {errors});
            return;
        }

        let hashed = bcrypt.hashSync(password, 8);
        await conn.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed]);
        conn.release();
        errors = "Successfully registered!";
        res.render("signup.ejs", {errors});
    } catch (e) {
        console.log(e)
        res.render("500.ejs");
    }
};