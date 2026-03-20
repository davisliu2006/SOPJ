import express from "express";
import * as svgCaptcha from "svg-captcha";
import * as globals from "./globals";

/**
 * GET /captcha
 * Generate a captcha image and store the text in session.
 * Response is an SVG image of the captcha.
 */
export function captcha(req: express.Request, res: express.Response) {
    let captcha = svgCaptcha.create();
    req.session.captcha = captcha.text;
    res.type("svg");
    res.status(200).send(captcha.data);
}