import * as express from "express";
import * as mariadb from "mariadb";

export const DIR = process.cwd();

export const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: '',
    connectionLimit: 5,
});