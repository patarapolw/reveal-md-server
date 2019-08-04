const express = require("express");
const fetch = require("node-fetch");
const matter = require("gray-matter");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();
let config = {};

if (fs.existsSync("reveal.config.json")) {
    config = JSON.parse(fs.readFileSync("reveal.config.json", "utf8"));
}

const app = express();

app.use(express.static("public"));
app.use("/dist", express.static("dist"));
app.set("view engine", "ejs");

app.get("/*", async (req, res, next) => {
    try {
        const url = req.params[0] || req.params.q;
        if (!url || url.startsWith("http")) {
            const md = url ? await (await fetch(url)).text() : fs.readFileSync(process.env.FILENAME || "README.md");
            const m = matter(md);
            m.data = {
                ...config,
                ...m.data
            };

            return res.render("index", {
                computedMd: m
            });
        }

        next();
    } catch (e) { next(e) }
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})
