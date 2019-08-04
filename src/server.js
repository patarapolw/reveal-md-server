const express = require("express");
const fetch = require("node-fetch");
const matter = require("gray-matter");
const fs = require("fs");

const app = express();

app.use(express.static("public"));
app.use("/dist", express.static("dist"));
app.set("view engine", "ejs");

app.get("/*", async (req, res, next) => {
    try {
        const url = req.params[0] || req.params.q;
        if (!url || url.startsWith("http")) {
            const md = url ? await (await fetch(url)).text() : fs.readFileSync("README.md");

            return res.render("index", {
                computedMd: matter(md)
            });
        }

        next();
    } catch (e) { next(e) }
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server running at port: ${port}`);
})
