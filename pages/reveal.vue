<template>
  <section style="width: 100vw; height: 100vh;">
    <div id="global" />
    <div class="reveal">
      <div class="slides" />
    </div>
  </section>
</template>

<script lang="ts">
import { MakeHtml } from '@patarapolw/make-html-frontend-functions'
import RevealMd from '@patarapolw/reveal-md-core'
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class RevealView extends Vue {
  mounted() {
    const makeHtml = new MakeHtml()
    new RevealMd((s) => makeHtml.render(s, !!process.env.sanitizeHtml))
  }
}
</script>

<style>
.stack.present {
  display: flex !important;
  justify-content: center;
  align-items: center;
}

.stack.present > .present {
  top: unset !important;
  max-height: 90%;
  overflow: scroll;
}
</style>
