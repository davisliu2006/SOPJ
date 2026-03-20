import express from "express";
export * from "./admin";
export * from "./captcha";
export * from "./contests";
export * from "./index";
export * from "./login";
export * from "./problems";
export * from "./submissions";
export * from "./users";

/**
 * GET /404
 */
export function error_404(req: express.Request, res: express.Response) {
    let user = req.user;
    let params = req.params;
    res.render("404.ejs", {user, params});
}

/**
 * GET /500
 */
export function error_500(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("500.ejs", {user});
}

/**
 * GET /permission-denied
 */
export function permission_denied(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("permission-denied.ejs", {user});
}