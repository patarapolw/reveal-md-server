<template lang="pug">
#App
  div(v-if="loadingInstance")
  component(v-else-if="layout" :is="layout")
    router-view
  router-view(v-else)
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { Loading } from 'element-ui'
import { ElLoadingComponent } from 'element-ui/types/loading'

import firebase from 'firebase/app'
import 'firebase/auth'

@Component
export default class App extends Vue {
  loadingInstance: ElLoadingComponent | null = process.env.NODE_ENV === 'development'
    ? Loading.service({})
    : null

  get user () {
    return this.$store.state.user
  }

  get layout () {
    const layout = this.$route.meta.layout
    return layout ? `${layout}-layout` : null
  }

  created () {
    if (process.env.NODE_ENV === 'development') {
      this.onUserChange()

      if (!localStorage.getItem('firebaseui::rememberedAccounts') && process.env.NODE_ENV === 'development') {
        const provider = new firebase.auth.GoogleAuthProvider()
        firebase.auth().signInWithPopup(provider)
      }
    }
  }

  @Watch('user')
  onUserChange () {
    if (!this.user) {
      setTimeout(() => {
        if (this.loadingInstance) {
          this.loadingInstance.close()
        }
        this.loadingInstance = null
      }, 3000)
    } else {
      if (this.loadingInstance) {
        this.loadingInstance.close()
      }
      this.loadingInstance = null
    }
    // this.onLoadingChange()
  }
}
</script>
