(async () => {
    const computedMd = (window as any).computedMd;

    if (computedMd.data.theme) {
        (document.getElementById("theme") as HTMLLinkElement).href = `/css/theme/${computedMd.data.theme}.css`;
    }
    
    if (computedMd.data.highlightTheme) {
        (document.getElementById("highlightTheme") as HTMLLinkElement).href = `/lib/css/${computedMd.data.highlightTheme}.css`;
    }

    let slideGroups = computedMd.content as string[][];
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
