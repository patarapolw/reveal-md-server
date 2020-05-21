<template lang="pug">
#Reveal(style="width: 100vw; height: 100vh;")
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

  get slug () {
    return this.$route.params.slug
  }

  async mounted () {
    if (this.id) {
      const r = await firebase.firestore().collection('reveal').doc(this.id).get()
      const { raw } = r.data() || {}
      if (raw) {
        this.placeholder = raw
      }
    } else if (this.slug) {
      const r = await firebase.firestore().collection('reveal').where('slug', '==', this.slug).limit(1).get()
      const d = r.docs[0]
      if (d) {
        this.placeholder = d.data().raw || ''
      }
    }

    window.revealMd = new RevealMd(this.placeholder)
  }
}
</script>
