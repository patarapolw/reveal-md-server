**Deprecated. Please use <https://github.com/patarapolw/reveal-md>**

---
theme : "beige"
transition: "zoom"
---

# [reveal-md-server](https://reveal-md.herokuapp.com/)

<https://github.com/patarapolw/reveal-md-server>

---

Opinionated branch of [Reveal-md](https://github.com/patarapolw/reveal-md)

This allows you to view markdown files online as a presentation in Reveal.js

To use this, go to `https://reveal-md.herokuapp.com/<YOUR_URL_HERE>`

---

You can also edit in Visual Studio Code using <https://marketplace.visualstudio.com/items?itemName=evilz.vscode-reveal>

---

//pug
:settings
    .element: class="fragment" data-fragment-index="2"
:markdown
    ### Update (2019-08-16)

    - Custom markdown
        - Tables and image resize with [Showdown.js](https://github.com/showdownjs/showdown), also, GitHub flavor.
        - Clone the project to use your own!
    - [Pug](https://pugjs.org) with [SCSS](https://sass-lang.com/) and custom markdown support
    - HTML conversion is now done at server-side
:scss
    li li {
        font-size: 0.8em;
    }

---

### Tips

- You can edit the (scoped) SCSS using Pug, for example,

```pug
//pug
:markdown
    ### Update (2019-08-16)

    - Custom markdown
        - Tables and image resize with [Showdown.js](https://github.com/showdownjs/showdown), also, GitHub flavor.
        - Clone the project to use your own!
    - [Pug](https://pugjs.org) with [SCSS](https://sass-lang.com/) and custom markdown support
    - HTML conversion is now done at server-side
:scss
    li li {
        font-size: 0.8em;
    }
```

---

To make the result global, try

```pug
//pug
style.
    .present {
        background-color: gray;
    }
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

```dotenv
FILENAME=<PATH_TO_FILENAME>
```

---

Overriding the YAML front matter by creating `reveal.config.json` containing the [config](https://github.com/hakimel/reveal.js/#configuration). In addition, `theme` and `highlightTheme` can also be edited.

---

Shuffle the slides by adding this to `reveal.config.json`

```json
{
    "shuffle": true
}
```

---

Please support by giving a ⭐ on [GitHub](https://github.com/patarapolw/reveal-md-server) or requesting features at <https://github.com/patarapolw/reveal-md-server/issues>
