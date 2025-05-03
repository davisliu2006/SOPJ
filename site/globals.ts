// import * as dotenv from "dotenv";
import DOMPurify from "dompurify";
import express from "express";
import {JSDOM} from "jsdom";
import * as jwt from "jsonwebtoken"
import * as mariadb from "mariadb";
import {marked} from "marked";
import * as env from "../include/env";

export const DIR = env.DIR;
console.log("Running from directory: "+DIR);

// get environment variables
export const DB_PASSWORD: string = env.DB_PASSWORD;
export const DB_USER: string = env.DB_USER;
export const HOSTNAME: string = env.HOSTNAME;
export const JUDGE_SUPPORT: boolean = env.JUDGE_SUPPORT;
export const JWTSECRET: string = env.JWTSECRET;
export const PORT: number = env.PORT;
export const SESSIONSECRET: string = env.SESSIONSECRET;

// type extensions
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
declare module "express-session" {
    interface SessionData {
        captcha: string;
    }
}

// mariadb connection pool
export const pool = mariadb.createPool({
    host: HOSTNAME,
    user: DB_USER,
    password: DB_PASSWORD,
    database: "opj",
    connectionLimit: 5,
});

// authenitcate user
export function jwtAuth(req: express.Request, res: express.Response) {
    try {
        let decode = jwt.verify(req.cookies["opj"], JWTSECRET);
        return decode;
    } catch {
        return null;
    }
}
export async function validateUser(user: any): Promise<number> {
    if (!user.userid || !user.username) {return 0;}
    try {
        let conn = await pool.getConnection();
        let rows = await conn.query("SELECT id, username, permissions FROM users WHERE id = ?;", [user.userid]);
        conn.release();
        if (rows.length < 1) {return 0;}
        if (rows[0].username != user.username) {return 0;}
        return rows[0].permissions;
    } catch (e) {
        console.log("User valiation failed.");
        return 0;
    }
}

export namespace dbSetup {
    export async function initUsers(conn: mariadb.PoolConnection) {
        await conn.query("CREATE TABLE IF NOT EXISTS users ( \
            id INT AUTO_INCREMENT PRIMARY KEY, \
            username VARCHAR(50) NOT NULL UNIQUE, \
            password VARCHAR(255) NOT NULL, \
            points INT DEFAULT 0, \
            problems INT DEFAULT 0, \
            permissions INT DEFAULT 1 \
        );");
    }
    export async function initProblems(conn: mariadb.PoolConnection) {
        await conn.query("CREATE TABLE IF NOT EXISTS problems ( \
            id INT AUTO_INCREMENT PRIMARY KEY, \
            name VARCHAR(50) NOT NULL, \
            points INT DEFAULT 0 \, \
            description VARCHAR(10000) DEFAULT '', \
            time INT DEFAULT 1, \
            memory INT DEFAULT 256 \
        );");
    }
    export async function initSubmissions(conn: mariadb.PoolConnection) {
        await conn.query("CREATE TABLE IF NOT EXISTS submissions ( \
            id INT AUTO_INCREMENT PRIMARY KEY, \
            problem INT NOT NULL, \
            user INT NOT NULL \, \
            language VARCHAR(50) NOT NULL, \
            code VARCHAR(10000) DEFAULT '', \
            status VARCHAR(50) DEFAULT '', \
            points INT DEFAULT 0, \
            totpoints INT DEFAULT 0, \
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP \
        );");
    }
}

// markdown to html converter
export async function mdToHTML(str: string) {
    // remove the most common zerowidth characters from the start of the file
    str = await marked.parse(
        str.replace(/^[\u200B\u200C\u200D\u200E\u200F\uFEFF]/,"")
    )

    // purify
    const window = new JSDOM("").window;
    const purify = DOMPurify(window);
    str = purify.sanitize(str, {
        SAFE_FOR_TEMPLATES: true,
        ALLOWED_TAGS: [
            "h1", "h2", "h3", "p", "a", // text
            "strong", "em", "ul", "li", "ol", // text formatting
            "br", "hr", // whitespaces
            "code", "pre", "blockquote" // code and quotes
        ]
    });

    return str;
}

// sanitize url
export function sanitizeURL(str: string) {
    return str.replace(/^https?:\/\/[^\/]+/, "")
}