import express from "express";
export * from "./admin";
export * from "./captcha";
export * from "./contests";
export * from "./index";
export * from "./login";
export * from "./problems";
export * from "./submissions";
export * from "./users";

export function error_404(req: express.Request, res: express.Response) {
    let user = req.user;
    let params = req.params;
    res.render("404.ejs", {user, params});
}

export function error_500(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("500.ejs", {user});
}

export function permission_denied(req: express.Request, res: express.Response) {
    let user = req.user;
    res.render("permission-denied.ejs", {user});
}