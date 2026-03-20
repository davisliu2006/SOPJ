import * as gobals from "./globals";
import * as database from "../database/database";

export interface JWTUser {
    userid: number;
    username: string;
}
export namespace JWTUser {
    export function staticValidate(obj: JWTUser): JWTUser {
        return obj;
    }
    export function validate(obj: any): JWTUser | null {
        if (!obj) {return null;}
        if (typeof(obj.userid) != "number") {return null;}
        if (typeof(obj.username) != "string") {return null;}
        return obj;
    }
}

export interface SQLModifyResult {
    affectedRows: number;
    serverStatus?: number;
    warningStatus?: number;
    message?: string;
}
export interface SQLInsertResult extends SQLModifyResult {
    insertId: number;
}
export interface SQLUpdateResult extends SQLModifyResult {
    changedRows: number;
}
export interface SQLDeleteResult extends SQLModifyResult {}
export interface SQLSelectResult<T = any> extends Array<T> {}

export interface UserData {
    id?: number;
    username?: string;
    password?: string;
    points?: number;
    problems?: number;
    permissions?: number;
}

export interface ProblemData {
    id?: number;
    name?: string;
    points?: number;
    description?: string;
    time?: number;
    memory?: number;
    // extension fields
    ptsEarned?: number;
    verdict?: string;
    config?: any;
}

export interface SubmissionData {
    id?: number;
    problem?: number;
    user?: number;
    language?: string;
    code?: string;
    status?: string;
    points?: number;
    totpoints?: number;
    timestamp?: Date;
    // extension fields
    problemName?: string;
    userName?: string;
    timestampStr?: string;
    json?: any;
}

// type extensions
declare global {
    namespace Express {
        interface Request {
            user?: JWTUser | null;
        }
    }
}
declare module "express-session" {
    interface SessionData {
        captcha: string;
    }
}