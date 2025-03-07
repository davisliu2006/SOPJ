// import * as dotenv from "dotenv";
import * as express from "express";
import * as jwt from "jsonwebtoken"
import * as mariadb from "mariadb";
import * as env from "./env";

export const DIR = process.cwd();

// get environment variables
export const JWTSECRET: string = env.JWTSECRET;
export const SESSIONSECRET: string = env.SESSIONSECRET;

// type extensions
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
declare module 'express-session' {
    interface SessionData {
        captcha: string;
    }
}

export const pool = mariadb.createPool({
    host: "localhost",
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
}