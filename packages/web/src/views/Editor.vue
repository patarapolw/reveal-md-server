<template lang="pug">
el-row.editor
  el-col.editor-col(:span="hasPreview ? 12 : 24")
    .title-nav
      div(style="flex-grow: 1;")
      .el-button
        a(:href="revealUrl" target="_blank") Get Link
      el-button(@click="hasPreview = !hasPreview") {{hasPreview ? 'Hide' : 'Show'}} Preview
      el-button(:disabled="!isEdited" @click="save") Save
    codemirror(v-model="markdown" ref="codemirror" @input="onCmCodeChange")
  el-col.preview-col(v-if="hasPreview" :span="12")
    RevealPreview(:id="id" :markdown="markdown" :cursor="cursor")
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import yaml from 'js-yaml'
import shortid from 'shortid'
import firebase from 'firebase/app'

import 'firebase/firestore'
import 'firebase/storage'

import RevealPreview from '../components/RevealPreview.vue'
import { normalizeArray, stringSorter, Matter } from '../assets/util'

declare global {
  namespace CodeMirror {
    interface Editor {
      on(type: 'paste', handler: (editor: CodeMirror.Editor, evt: ClipboardEvent) => void): void
    }
  }
}

@Component<Editor>({
  beforeRouteLeave (to, from, next) {
    const msg = this.isEdited ? 'Please save before leaving.' : null

    if (msg) {
      this.$confirm(msg, 'Warning', {
        confirmButtonText: 'Leave',
        type: 'warning'
      })
        .then(() => next())
        .catch(() => next(false))
    } else {
      next()
    }
  },
  components: {
    RevealPreview
  }
})
export default class Editor extends Vue {
  markdown = ''

  hasPreview = true
  isLoading = false
  isEdited = false
  cursor = 0

  readonly matter = new Matter()

  get id () {
    return normalizeArray(this.$route.query.id)
  }

  get slug () {
    return this.$route.params.slug
  }

  get revealUrl () {
    return this.matter.header.slug
      ? this.$router.resolve(`/reveal/${this.matter.header.slug}`).href
      : this.$router.resolve({
        path: '/reveal',
        query: {
          id: this.id
        }
      }).href
  }

  get codemirror (): CodeMirror.Editor {
    return (this.$refs.codemirror as any).codemirror
  }

  created () {
    this.load()
  }

  mounted () {
    this.isEdited = false
    this.codemirror.setSize('100%', '100%')
    this.codemirror.addKeyMap({
      'Cmd-S': () => { this.save() },
      'Ctrl-S': () => { this.save() }
    })

    this.codemirror.on('cursorActivity', (instance) => {
      this.cursor = instance.getCursor().line
    })

    this.codemirror.on('paste', (ins, evt) => {
      const { items } = evt.clipboardData || {} as any
      if (items) {
        for (const k of Object.keys(items)) {
          const item = items[k] as DataTransferItem
          if (item.kind === 'file') {
            evt.preventDefault()
            const blob = item.getAsFile()!
            const cursor = ins.getCursor()

            firebase.storage().ref().child(shortid.generate()).put(blob)
              .then((r) => {
                ins.getDoc().replaceRange(`![${this.formatDate()}](${r.downloadURL})`, cursor)
              })
          }
        }
      }
    })

    window.onbeforeunload = (e: any) => {
      const msg = this.isEdited ? 'Please save before leaving.' : null
      if (msg) {
        e.returnValue = msg
        return msg
      }
    }
  }

  beforeDestroy () {
    window.onbeforeunload = null
  }

  formatDate (d?: Date) {
    return dayjs(d).format('YYYY-MM-DD HH:mm Z')
  }

  @Watch('id')
  @Watch('slug')
  async load () {
    this.isLoading = true

    if (this.id) {
      const data = (await firebase.firestore().collection('reveal').doc(this.id).get()).data()

      if (data) {
        const { raw, ...header } = data
        this.markdown = this.matter.stringify(raw, header)

        setTimeout(() => {
          this.isEdited = false
        }, 100)
      }
    }

    this.isLoading = false
  }

  async save () {
    if (!this.isEdited) {
      return
    }

    if (!this.id) {
      /**
       * Create a post
       */
      const newId = shortid.generate()
      const newSlug = this.matter.header.slug || shortid.generate()

      await firebase.firestore().collection('reveal').doc(newId).set({
        created: this.formatDate(),
        ...this.matter.header,
        slug: newSlug,
        raw: this.markdown
      })

      this.$router.push({
        query: {
          id: newId
        }
      })
    } else {
      await firebase.firestore().collection('reveal').doc(this.id).set({
        ...this.matter.header,
        raw: this.markdown
      })
    }

    this.$message('Saved')

    setTimeout(() => {
      this.isEdited = false
    }, 100)
  }

  onCmCodeChange () {
    this.isEdited = true
    this.matter.parse(this.markdown)
  }
}
</script>

<style lang="scss">
.header-buttons {
  margin-bottom: 0 !important;

  .button {
    margin-bottom: 0 !important;
  }
}

.editor {
  flex-grow: 1;

  .title-nav {
    display: flex;
    padding: 10px;
    background-color: #ffeaa7;
    align-items: center;
  }

  .editor-col, .preview-col {
    height: 100vh;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
  }

  .vue-codemirror {
    flex-grow: 1;
  }
}

.CodeMirror-lines {
  padding-bottom: 100px;
}

.CodeMirror-line {
  word-break: break-all !important;
}
</style>
