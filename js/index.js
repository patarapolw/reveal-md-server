(async () => {
    let mdUrl;

    try {
        mdUrl = new URL(location.hash.substring(1)).href;
    } catch (e) {
        try {
            mdUrl = new URL(new URLSearchParams(location.search).get("q")).href;
        } catch (e_) {
            mdUrl = "https://raw.githubusercontent.com/patarapolw/reveal-md-server/master/README.md";
        }
    }

    document.getElementById("markdown-ext").setAttribute("data-markdown", mdUrl);

    // More info about config & dependencies:
    // - https://github.com/hakimel/reveal.js#configuration
    // - https://github.com/hakimel/reveal.js#dependencies
    Reveal.initialize({
        dependencies: [
            { src: 'plugin/markdown/marked.js' },
            { src: 'plugin/markdown/markdown.js' },
            { src: 'plugin/notes/notes.js', async: true },
            { src: 'plugin/highlight/highlight.js', async: true }
        ]
    });
})().catch(console.error);
