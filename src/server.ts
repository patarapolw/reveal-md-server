import express from "express";
import fetch from "node-fetch";
import matter from "gray-matter";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { contentToHtml } from "./lib/parser";
import shortid from "shortid";

dotenv.config();
let config = {};

if (fs.existsSync("reveal.config.json")) {
    config = JSON.parse(fs.readFileSync("reveal.config.json", "utf8"));
}

const app = express();

app.use(express.static("public"));
app.use("/dist", express.static("dist"));
app.set("view engine", "ejs");

const data: Record<string, any> = {};

app.get("/*", async (req, res, next) => {
    try {
        const url = req.params[0] || req.query.q;
        if (!url || url.startsWith("http")) {
            const filename = url || process.env.FILENAME || "README.md";
            const md = url ? await (await fetch(url)).text() : fs.readFileSync(process.env.FILENAME || "README.md");
            const m = matter(md);
            m.data = {
                ...config,
                ...m.data
            };

            if (filename === "README.md") {
                m.data.shuffle = false;
            }

            (m as any).content = contentToHtml(m.content, path.extname(filename) as any);

            const id = shortid.generate();
            data[id] = m;

            return res.render("index", {id});
        }

        next();
    } catch (e) { next(e) }
});

app.post("/:id", (req, res) => {
    return res.json(data[req.params.id]);
})

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
})