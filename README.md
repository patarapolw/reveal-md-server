---
theme : "beige"
transition: "zoom"
---

# reveal-md-server

<https://github.com/patarapolw/reveal-md-server>

---

Opinionated branch of [Reveal-md](https://github.com/patarapolw/reveal-md)

This allows you to view markdown files online as a presentation in Reveal.js

To use this, go to `https://reveal-md.herokuapp.com/<YOUR_URL_HERE>`

---

You can also edit in Visual Studio Code using <https://marketplace.visualstudio.com/items?itemName=evilz.vscode-reveal>

---

### Tips

- You can edit the CSS using the inline CSS, for example

```html
<style>img { max-height: 500px !important; }</style>
<style>li { font-size: 30px; }</style>
```

---

To make the result local, try

```html
<!-- .slide: class="slideName" -->
<style>.slideName img { max-height: 500px !important; }</style>
```

---

You can also navigate up and down...

--

See, you can, right?

--

This can be ideal for creating a simple flashcard.

---

## Running a local server

There will be more options to customize, including "running local files", "overriding" and "shuffle"

---

Overriding the local file by creating an `.env` file containing,

```
FILENAME=<PATH_TO_FILENAME>
```

---

Overriding the YAML front matter by creating `reveal.config.json` containing the config.

---

Shuffle the slides by adding this to `reveal.config.json`

```json
{
    "shuffle": true
}
```

---

Please support by giving a star on [GitHub](https://github.com/patarapolw/reveal-md-server) or requesting features at <https://github.com/patarapolw/reveal-md-server/issues>
