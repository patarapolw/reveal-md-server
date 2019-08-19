(async () => {
    const computedMd = await (await fetch(`/${(window as any).id}`, {method: "POST"})).json();

    const titleTag = document.getElementsByTagName("title")[0];
    const headTag = document.getElementsByTagName("head")[0];
    const bodyTag = document.getElementsByTagName("body")[0];

    let {title, css, js} = computedMd.data;

    if (title) {
        titleTag.innerText = title;
    }

    if (css) {
        if (!Array.isArray(css)) {
            css = [css];
        }

        for (const c of css) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = c;
            headTag.append(link);
        }
    }

    if (js) {
        if (!Array.isArray(js)) {
            js = [js];
        }

        for (const j of js) {
            const script = document.createElement("script");
            script.src = j;
            bodyTag.append(script);
        }
    }

    if (computedMd.data.theme) {
        (document.getElementById("theme") as HTMLLinkElement).href = `/css/theme/${computedMd.data.theme}.css`;
    }
    
    if (computedMd.data.highlightTheme) {
        (document.getElementById("highlightTheme") as HTMLLinkElement).href = `/lib/css/${computedMd.data.highlightTheme}.css`;
    }

    let slideGroups = computedMd.slides as string[][];
    const markdownSections = document.getElementById("markdownSections") as HTMLDivElement;

    slideGroups.forEach((slides) => {
        const section = document.createElement("section");
        
        if (slides.length > 1) {
            slides.forEach((s) => {
                const subSection = document.createElement("section");
                subSection.setAttribute("data-transition", "slide");
                subSection.innerHTML = s;
                section.append(subSection);
            });
        } else {
            section.innerHTML = slides[0];
        }

        markdownSections.appendChild(section);
    });

    // More info about config & dependencies:
    // - https://github.com/hakimel/reveal.js#configuration
    // - https://github.com/hakimel/reveal.js#dependencies
    Reveal.initialize({
        ...computedMd.data,
        dependencies: [
            { src: '/plugin/markdown/marked.js' },
            { src: '/plugin/markdown/markdown.js' },
            { src: '/plugin/notes/notes.js', async: true },
            { src: '/plugin/highlight/highlight.js', async: true }
        ]
    });
})().catch(console.error);
