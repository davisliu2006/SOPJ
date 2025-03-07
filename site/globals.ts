// import * as dotenv from "dotenv";
import * as env from "./env";
import * as express from "express";
import * as mariadb from "mariadb";

export const DIR = process.cwd();

// dotenv.config();
export const JWTSECRET: string = env.JWTSECRET;

export const pool = mariadb.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "opj",
    connectionLimit: 5,
});