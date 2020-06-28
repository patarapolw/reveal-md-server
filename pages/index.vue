<template>
  <section class="Editor" :class="hasPreview ? 'two-columns' : 'one-column'">
    <section class="EditorColumn column" @scroll="onScroll">
      <nav class="title-nav">
        <div class="flex-grow" />
        <button
          @click="hasPreview = !hasPreview"
          @keypress="hasPreview = !hasPreview"
        >
          {{ hasPreview ? 'Hide' : 'Show' }} Preview
        </button>

        <button :disabled="!canSave" @click="save" @keypress="save">
          Save
        </button>
      </nav>

      <codemirror ref="codemirror" v-model="markdown" @input="onCmCodeChange" />
    </section>

    <section v-if="hasPreview" class="PreviewColumn column">
      <RevealPreview :markdown="markdown" :cursor="cursor" />
    </section>
  </section>
</template>

<script lang="ts">
import { Matter } from '@patarapolw/reveal-md-core/dist/matter'
import {} from 'codemirror'
import dayjs from 'dayjs'
import yaml from 'js-yaml'
import { Component, Vue } from 'nuxt-property-decorator'
import Swal from 'sweetalert2'

declare global {
  namespace CodeMirror {
    interface Editor {
      on(
        type: 'paste',
        handler: (editor: CodeMirror.Editor, evt: ClipboardEvent) => void
      ): void
    }
  }
}
@Component<Editor>({
  beforeRouteLeave(_from, _to, next) {
    const msg = this.canSave ? 'Please save before leaving.' : null
    if (msg) {
      Swal.fire({
        text: msg,
        icon: 'warning',
        showCancelButton: true,
        cancelButtonColor: '#d33',
      })
        .then((r) => {
          r.value ? next() : next(false)
        })
        .catch(() => next(false))
    } else {
      next()
    }
  },
  beforeDestroy() {
    if (typeof window !== 'undefined') {
      window.onbeforeunload = null
    }
  },
})
export default class Editor extends Vue {
  guid = Math.random().toString(36).substr(2)

  markdown = ''
  hasPreview = true
  isLoading = false
  isEdited = false
  cursor = 0
  scrollSize = 0

  urlMetadata: Map<string, any> = new Map()

  canSave = true

  readonly noTitle = 'Title must not be empty'
  readonly matter = new Matter()

  get title() {
    return this.matter.header.title || ''
  }

  get type() {
    return this.matter.header.type || ''
  }

  get codemirror(): CodeMirror.Editor {
    return (this.$refs.codemirror as any).codemirror
  }

  created() {
    this.load()
  }

  mounted() {
    window.onbeforeunload = (e: any) => {
      const msg = this.canSave ? 'Please save before leaving.' : null
      if (msg) {
        e.returnValue = msg
        return msg
      }
    }

    this.initializeCodemirror(this.codemirror)
  }

  initializeCodemirror(cm: CodeMirror.Editor) {
    // this.isReady = true
    cm.addKeyMap({
      'Cmd-S': () => {
        this.save()
      },
      'Ctrl-S': () => {
        this.save()
      },
    })
    cm.on('cursorActivity', (instance) => {
      this.cursor = instance.getCursor().line
    })
    cm.on('paste', async (ins, evt) => {
      const { items } = evt.clipboardData || ({} as any)
      if (items) {
        for (const k of Object.keys(items)) {
          const item = items[k] as DataTransferItem
          if (process.env.isServer && item.kind === 'file') {
            evt.preventDefault()
            const blob = item.getAsFile()!
            const formData = new FormData()
            formData.append('file', blob)
            const cursor = ins.getCursor()
            const { filename, url } = await this.$axios.$post(
              '/api/upload',
              formData
            )
            ins.getDoc().replaceRange(`![${filename}](${url})`, cursor)
          } else {
            const cursor = ins.getCursor()
            item.getAsString(async (str) => {
              if (/^https?:\/\/[^ ]+$/.test(str)) {
                evt.preventDefault()
                const unloadedXCard = `<a data-make-html="card" href="${encodeURI(
                  str
                )}">${encodeURI(str)}</a>`
                ins.getDoc().replaceRange(unloadedXCard, cursor, {
                  line: cursor.line,
                  ch: cursor.ch + str.length,
                })
                if (!process.env.isServer) {
                  return false
                }
                const href = str
                if (href) {
                  if (!this.urlMetadata.has(href)) {
                    this.urlMetadata.set(href, {})
                    const metadata = await this.$axios.$get('/api/metadata', {
                      params: {
                        url: href,
                      },
                    })
                    this.urlMetadata.set(href, metadata)
                  }
                  ins.getDoc().replaceRange(
                    '```pug parsed\n' +
                      `a(data-make-html="card" href="${encodeURI(str)}")\n` +
                      `  | ${encodeURI(str)}\n` +
                      '  pre(data-template style="display: none;").\n' +
                      yaml
                        .safeDump(this.urlMetadata.get(href))
                        .split('\n')
                        .map((line) => (line ? `    ${line}` : line))
                        .join('\n') +
                      '```\n',
                    cursor,
                    {
                      line: cursor.line,
                      ch: cursor.ch + unloadedXCard.length,
                    }
                  )
                }
              }
            })
          }
        }
      }
    })
  }

  formatDate(d: Date) {
    return dayjs(d).format('YYYY-MM-DD HH:mm Z')
  }

  async load() {
    this.isLoading = true
    this.guid = Math.random().toString(36).substr(2)
    const { data } = await this.$axios.$get('/api/post')

    this.markdown = data
    this.matter.parse(this.markdown)
    setTimeout(() => {
      this.isEdited = false
    }, 100)
    this.isLoading = false
  }

  async save() {
    if (!this.canSave) {
      return
    }

    if (!process.env.isServer) {
      Swal.fire({
        toast: true,
        timer: 3000,
        icon: 'warning',
        text: 'Cannot save in preview mode',
        position: 'top-end',
        showConfirmButton: false,
      })

      return
    }

    await this.$axios.$put('/api/post', { data: this.markdown })

    Swal.fire({
      toast: true,
      timer: 3000,
      text: 'Saved',
      position: 'top-end',
      showConfirmButton: false,
    })
    setTimeout(() => {
      this.isEdited = false
    }, 100)
  }

  onCmCodeChange() {
    this.isEdited = true
    this.matter.parse(this.markdown)
  }

  onScroll(evt: any) {
    this.scrollSize =
      evt.target.scrollTop / (evt.target.scrollHeight - evt.target.clientHeight)
    this.$forceUpdate()
  }
}
</script>

<style scoped>
.vue-codemirror {
  flex-grow: 1;
}

.vue-codemirror >>> .CodeMirror {
  height: 100% !important;
}

.vue-codemirror >>> .CodeMirror-lines {
  padding-bottom: 100px;
}

.vue-codemirror >>> .CodeMirror-line {
  word-break: break-all !important;
}

.Editor {
  width: 100vw;
  height: 100vh;
  display: grid;
}

.Editor.one-column {
  grid-template-columns: 1fr;
}

.Editor.two-columns {
  grid-template-columns: 1fr 1fr;
}

nav.title-nav {
  display: flex;
  padding: 10px;
  background-color: #ffeaa7;
  align-items: center;
  font-family: sans-serif;
}

nav.title-nav button {
  font-size: 1em;
  background-color: white;
  border-radius: 5px;
  padding: 0.3em;
}

nav.title-nav button + button {
  margin-left: 0.5em;
}

.column {
  height: 100vh;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
}

.flex-grow {
  flex-grow: 1;
}
</style>
