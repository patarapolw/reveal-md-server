<template lang="pug">
#Reveal
  #global(style="display: none;")
  .reveal
    .slides
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import firebase from 'firebase/app'

import { normalizeArray } from '../assets/util'
import { RevealMd } from '../assets/reveal'

import 'firebase/firestore'

@Component
export default class Reveal extends Vue {
  placeholder = ''

  get id () {
    return normalizeArray(this.$route.query.id)
  }

  async mounted () {
    if (this.id) {
      const r = await firebase.firestore().collection('reveal').doc(this.id).get()
      const { raw } = r.data() || {}
      if (raw) {
        this.placeholder = raw
      }
    }

    window.revealMd = new RevealMd(this.placeholder)
  }
}
</script>
