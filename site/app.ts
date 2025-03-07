import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as jwt from "jsonwebtoken";
import * as globals from "./globals";
import * as pages from "./pages";

let app = express();
app.set("view engine", "ejs");
app.set("views", globals.DIR+"/views");
app.use(express.static(globals.DIR+"/static"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(function(req, res, next) {
    req.user = globals.jwtAuth(req, res);
    console.log(req.user);
    next();
})

app.get("/", pages.index);

app.get("/about", pages.about);

app.get("/users", pages.users);

app.get("/problems", pages.problems);
app.get("/problems-view", pages.problems_view);
app.get("/problems-submit", pages.problems_submit);

app.get("/contests", pages.contests);

app.get("/login", pages.login);
app.get("/signup", pages.signup);
app.post("/signup-request", pages.signup_request);
app.post("/login-request", pages.login_request);

app.get("/*", function(req, res) {
    let params = req.params;
    res.render("404.ejs", {params});
});

app.listen(3000);