// import * as dotenv from "dotenv";
import * as express from "express";
import * as jwt from "jsonwebtoken"
import * as mariadb from "mariadb";
import * as env from "./env";

export const DIR = process.cwd();

// get environment variables
export const JWTSECRET: string = env.JWTSECRET;

// types extensions
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
declare global {
    namespace Express {
        interface Request {
            errors?: any;
        }
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