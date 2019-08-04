import matter from "gray-matter";

(async () => {
    let mdUrl;

    try {
        mdUrl = new URL(location.hash.substring(1)).href;
    } catch (e) {
        try {
            mdUrl = new URL(new URLSearchParams(location.search).get("q")!).href;
        } catch (e_) {
            mdUrl = "https://raw.githubusercontent.com/patarapolw/reveal-md-server/master/README.md";
        }
    }

    const computedMd = matter(await (await fetch(mdUrl)).text());
    
    if (computedMd.data.theme) {
        (document.getElementById("theme") as HTMLLinkElement).href = `css/theme/${computedMd.data.theme}.css`;
    }
    
    if (computedMd.data.highlightTheme) {
        (document.getElementById("highlightTheme") as HTMLLinkElement).href = `lib/css/${computedMd.data.highlightTheme}.css`;
    }

    let slides = computedMd.content.split(/^---$/gm);
    const markdownSections = document.getElementById("markdownSections") as HTMLDivElement;

    slides.forEach((slide) => {
        const section = document.createElement("section");
        section.setAttribute("data-markdown", "");

        const secs = slide.split(/^--$/gm);
        if (secs.length > 1) {
            secs.forEach((sec) => {
                const subSection = document.createElement("section");
                subSection.setAttribute("data-markdown", "");

                const script = document.createElement("script");
                script.setAttribute("type", "text/template");
                script.innerHTML = sec;

                subSection.append(script);
                section.append(subSection);
            });
        } else {
            const script = document.createElement("script");
            script.setAttribute("type", "text/template");
            script.innerHTML = slide;

            section.appendChild(script);
        }

        markdownSections.appendChild(section);
    });

    // More info about config & dependencies:
    // - https://github.com/hakimel/reveal.js#configuration
    // - https://github.com/hakimel/reveal.js#dependencies
    Reveal.initialize({
        ...computedMd.data,
        dependencies: [
            { src: 'plugin/markdown/marked.js' },
            { src: 'plugin/markdown/markdown.js' },
            { src: 'plugin/notes/notes.js', async: true },
            { src: 'plugin/highlight/highlight.js', async: true, callback() {
                hljs.initHighlightingOnLoad();
            } }
        ]
    });
})().catch(console.error);
