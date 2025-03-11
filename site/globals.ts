// import * as dotenv from "dotenv";
import DOMPurify from "dompurify";
import express from "express";
import session from "express-session";
import * as fs from "fs";
import {JSDOM} from "jsdom";
import * as jwt from "jsonwebtoken"
import * as mariadb from "mariadb";
import {marked} from "marked";
import * as env from "../include/env";

export const DIR = env.DIR;
console.log("Running from directory: "+DIR);

// get environment variables
export const HOSTNAME: string = env.HOSTNAME;
export const ISDEPLOY: boolean = env.ISDEPLOY;
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

export const pool = mariadb.createPool({
    host: HOSTNAME,
    user: "root",
    password: "",
    database: "opj",
    connectionLimit: 5,
});

export function jwtAuth(req: express.Request, res: express.Response) {
    try {
        let decode = jwt.verify(req.cookies["opj"], JWTSECRET);
        return decode;
    } catch {
        return null;
    }
}

export namespace dbSetup {
    export function initUsers(conn: mariadb.PoolConnection) {
        conn.query("CREATE TABLE IF NOT EXISTS users ( \
            id INT AUTO_INCREMENT PRIMARY KEY, \
            username VARCHAR(50) NOT NULL UNIQUE, \
            password VARCHAR(255) NOT NULL, \
            points INT DEFAULT 0 \
        );");
    }
    export function initProblems(conn: mariadb.PoolConnection) {
        conn.query("CREATE TABLE IF NOT EXISTS problems ( \
            id INT AUTO_INCREMENT PRIMARY KEY, \
            name VARCHAR(50) NOT NULL, \
            points INT DEFAULT 0 \, \
            description VARCHAR(10000) DEFAULT '' \
        );");
    }
    export function initSubmissions(conn: mariadb.PoolConnection) {
        conn.query("CREATE TABLE IF NOT EXISTS submissions ( \
            id INT AUTO_INCREMENT PRIMARY KEY, \
            problem INT NOT NULL, \
            user INT NOT NULL \, \
            language VARCHAR(50) NOT NULL, \
            code VARCHAR(10000) DEFAULT '', \
            status VARCHAR(50) DEFAULT '' \
        );");
    }
}

export function mkdirP(path: string) {
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }
}

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