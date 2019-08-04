const express = require("express");
const bodyPaser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");
const matter = require("gray-matter");

const app = express();

app.use("/css", express.static("css"));
app.use("/js", express.static("js"));
app.use("/dist", express.static("dist"));
app.use("/plugin", express.static("plugin"));
app.use("/lib", express.static("lib"));

app.use(bodyPaser.json());
app.post("/fetch", async (req, res, next) => {
    try {
        return res.json(matter(await (await fetch(req.body.url)).text()));
    } catch (e) { next(e) }
});

app.get("/", (req, res) => {
    return res.sendFile(path.resolve("index.html"))
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`Server running at port: ${port}`);
})
