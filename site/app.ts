import * as express from "express";
import * as pages from "./pages"

const DIR = process.cwd();

let app = express();
app.set("view engine", "ejs");
app.set("views", DIR+"/views");
app.use(express.static(DIR+"/static"));

app.get("/", pages.index);

app.get("/about", pages.about);

app.get("/users", pages.users);

app.get("/problems", pages.problems);
app.get("/problems-view", pages.problems_view);
app.get("/problems-submit", pages.problems_submit);

app.get("/contests", pages.contests);

app.get("/login", pages.login);
app.get("/signup", pages.signup);

app.get("/*", function(req, res) {
    let params = req.params;
    res.render("404.ejs", {params});
});

app.listen(3000);