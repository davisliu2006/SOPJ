import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
import multer from 'multer';
import * as jwt from "jsonwebtoken";
import * as globals from "./globals";
import * as pages from "./pages";

let app = express();
app.set("view engine", "ejs");
app.set("views", globals.DIR+"/views");
app.use(express.static(globals.DIR+"/static"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    secret: globals.SESSIONSECRET, // replace with a secure secret
    resave: false, saveUninitialized: true,
    cookie: {secure: false}
}));

app.use(function(req, res, next) {
    console.log("Unreleased DB connections: "+globals.pool.activeConnections());
    req.user = globals.jwtAuth(req, res);
    next();
})

const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

app.get("/", pages.index);

app.get("/about", pages.about);
app.get("/terms", pages.terms);

app.get("/users", pages.users);
app.get("/users-view", pages.users_view);

app.get("/problems", pages.problems);
app.get("/problems-view", pages.problems_view);
app.get("/problems-submit", pages.problems_submit);
app.post("/submit-request", pages.submit_request);
app.get("/problems-create", pages.problems_create);
app.post("/create-problem", pages.create_problem);
app.get("/problems-edit", pages.problems_edit);
app.post("/edit-problem", upload.single("test-cases"), pages.edit_problem);

app.get("/submissions", pages.submissions);
app.get("/submissions-view", pages.submissions_view);
app.get("/regrade-request", pages.regrade_request);

app.get("/contests", pages.contests);

app.get("/login", pages.login);
app.get("/signup", pages.signup);
app.post("/signup-request", pages.signup_request);
app.post("/login-request", pages.login_request);
app.get("/logout", pages.logout)
app.get("/account", pages.account)

app.get("/captcha", pages.captcha);

app.get("/permission-denied", pages.permission_denied);
app.get("/error-500", pages.error_500);
app.get("/*", pages.error_404);

app.listen(globals.PORT);