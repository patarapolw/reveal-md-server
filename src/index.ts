(async () => {
    const computedMd = (window as any).computedMd;

    if (computedMd.data.theme) {
        (document.getElementById("theme") as HTMLLinkElement).href = `/css/theme/${computedMd.data.theme}.css`;
    }
    
    if (computedMd.data.highlightTheme) {
        (document.getElementById("highlightTheme") as HTMLLinkElement).href = `/lib/css/${computedMd.data.highlightTheme}.css`;
    }

    let slides = (computedMd.content as string).split(/^---$/gm);
    const markdownSections = document.getElementById("markdownSections") as HTMLDivElement;

    slides.forEach((slide) => {
        const section = document.createElement("section");
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
            section.setAttribute("data-markdown", "");

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
            { src: '/plugin/markdown/marked.js' },
            { src: '/plugin/markdown/markdown.js' },
            { src: '/plugin/notes/notes.js', async: true },
            { src: '/plugin/highlight/highlight.js', async: true }
        ]
    });
})().catch(console.error);
