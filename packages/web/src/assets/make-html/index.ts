import HyperPug from 'hyperpug'
import stylis from 'stylis'
import hljs from 'highlight.js'
import { elementOpen, elementClose, patch } from 'incremental-dom'
import hljsDefineVue from 'highlightjs-vue'
import MarkdownIt from 'markdown-it'
import { unescapeAll } from 'markdown-it/lib/common/utils'
import emoji from 'markdown-it-emoji'
import imsize from 'markdown-it-imsize'
import mdContainer from 'markdown-it-container'
import ghHeading from 'markdown-it-github-headings'

import { makeIncremental } from './make-incremental'
import { liquid } from './template'

hljsDefineVue(hljs)

export default class MakeHtml {
  md: MarkdownIt
  hp: HyperPug

  html = ''

  constructor (
    public id = 'el-' + Math.random().toString(36).substr(2),
    opts?: {
      ghHeading: boolean
    }
  ) {
    this.md = MarkdownIt({
      breaks: true
    })
      .use((md) => {
        const { fence } = md.renderer.rules

        md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
          const token = tokens[idx]
          const info = token.info ? unescapeAll(token.info).trim() : ''
          const content = token.content

          if (info === 'pug parsed') {
            return this._pugConvert(content)
          } else if (info === 'css parsed') {
            return this._makeCss(content)
          }

          return fence!(tokens, idx, options, env, slf)
        }
        return md
      })
      .use(emoji)
      .use(imsize)
      .use(mdContainer, 'spoiler', {
        validate: (params: string) => {
          return params.trim().match(/^spoiler(?:\s+(.*))?$/)
        },
        render: (tokens: any[], idx: number) => {
          var m = tokens[idx].info.trim().match(/^spoiler(?:\s+(.*))?$/)

          if (tokens[idx].nesting === 1) {
            // opening tag
            return '<details style="margin-bottom: 1rem;"><summary>' + this.md.utils.escapeHtml(m[1] || 'Spoiler') + '</summary>\n'
          } else {
            // closing tag
            return '</details>\n'
          }
        }
      })

    if (opts) {
      if (opts.ghHeading) {
        this.md = this.md.use(ghHeading)
      }
    }

    this.hp = new HyperPug({
      markdown: (s) => this._mdConvert(s),
      css: (s) => this._mdConvert(s)
    })
  }

  render (dom: HTMLElement, s: string) {
    try {
      this.html = this._mdConvert(s)
    } catch (e) {}

    try {
      patch(dom, () => {
        try {
          elementOpen('div', this.id, ['class', this.id])
          makeIncremental(this.html)()
          elementClose('div')
        } catch (_) {}
      })
      const d1 = this._postrender(dom)
      this.html = d1.innerHTML
    } catch (_) {}
  }

  getDOM (s: string) {
    try {
      this.html = this._mdConvert(s)
    } catch (e) {}

    const output = document.createElement('div')
    output.className = this.id
    output.innerHTML = this.html

    this._postrender(output)

    return output
  }

  private _prerender (s: string) {
    return liquid.parseAndRenderSync(s)
  }

  private _postrender (dom: HTMLElement) {
    dom.querySelectorAll('iframe').forEach((el) => {
      const w = el.width
      const h = el.height

      const style = getComputedStyle(el)

      el.style.width = el.style.width || style.width || (w ? `${w}px` : '')
      el.style.height = el.style.height || style.height || (h ? `${h}px` : '')
    })

    dom.querySelectorAll('pre code').forEach((el) => {
      hljs.highlightBlock(el)
    })

    return dom
  }

  private _pugConvert (s: string) {
    return this.hp.parse(s)
  }

  private _mdConvert (s: string) {
    const html = this.md.render(s)
    return this._prerender(html)
  }

  private _makeCss (s: string) {
    return `<style>${stylis(`.${this.id}`, s.replace(/\s+/gs, ' '))}</style>`
  }
}
