<template lang="pug">
.query-view
  el-menu(mode="horizontal" style="display: flex;")
    div(style="flex-grow: 1; pointer-events: none;")
    el-menu-item(index="1")
      router-link(to="/admin/edit") New
    el-menu-item(index="2")
      span(role="button" @click="load()") Reload
    el-submenu(index="3" :disabled="checked.length === 0")
      template(slot="title") Batch Edit
      el-menu-item.cursor-pointer(index="3-1" role="button" @click="doDelete") Delete
  el-table(
    :data="items" style="width: 100%"
    :default-sort="sort" sortable="custom" @sort-change="onSort"
    @selection-change="checked = $event"
    @row-click="openItem($event)"
    :height="tableHeight"
  )
    el-table-column(type="selection" width="50")
    el-table-column(property="id" label="ID" width="200")
    el-table-column(property="slug" label="Slug" width="200")
    el-table-column(property="title" label="Title" sortable)
    el-table-column(property="created" label="Created" sortable width="250")
    el-table-column(property="tag" label="Tag" width="200")
      template(slot-scope="scope")
        el-tag.tag(v-for="t in scope.row.tag" style="margin-right: 1em;" :key="t" size="small") {{t}}
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import dayjs from 'dayjs'
import firebase from 'firebase/app'

import 'firebase/firestore'

import { normalizeArray, stringSorter } from '../assets/util'

@Component
export default class Query extends Vue {
  checked: any[] = []
  items: any[] = []

  tableHeight = window.innerHeight - 60
  sort = {
    prop: 'created',
    order: 'descending'
  }

  isLoading = false

  get q () {
    return normalizeArray(this.$route.query.q) || ''
  }

  mounted () {
    this.load()
  }

  @Watch('q')
  @Watch('sort', { deep: true })
  async load () {
    this.loadMore()
  }

  async loadMore (endOfScroll = false) {
    this.$set(this, 'checked', [])

    let cursor = firebase.firestore().collection('reveal') as firebase.firestore.Query<firebase.firestore.DocumentData>
    this.q.split(' ')
      .map((el) => el.split(/([:><])(.+)$/))
      .map((ls) => {
        const [k, op, v] = ls
        if (v) {
          if (k === 'tag') {
            cursor = cursor.where('tag', 'array-contains', v)
          } else if (op === ':') {
            cursor = cursor.where(k, '==', v)
          } else {
            cursor = cursor.where(k, op as '>' | '<', v)
          }
        }
      })

    cursor = cursor.orderBy(this.sort.prop, this.sort.order === 'descending' ? 'desc' : 'asc')
    if (endOfScroll) {
      const lastItem = this.items[this.items.length - 1]
      if (lastItem) {
        cursor = cursor.startAfter(lastItem[this.sort.prop])
      }
    } else {
      this.items = []
      this.$set(this, 'items', this.items)
    }

    const r = await cursor.limit(10).get()
    r.docs.map((d) => {
      const data = d.data()
      data.id = d.id

      this.items.push(data)
    })

    this.$set(this, 'items', this.items)
  }

  onSort (evt: { column: string, prop: string, order: string }) {
    this.sort.prop = evt.prop
    this.sort.order = evt.order
    this.load()
  }

  async doDelete () {
    this.$confirm('Are you sure you want to delete the selected posts?', 'Deleting media', {
      confirmButtonText: 'Delete',
      type: 'warning'
    })
      .then(async () => {
        await Promise.all(this.checked.map(({ id }) => {
          return firebase.firestore().collection('reveal').doc(id).delete()
        }))

        this.load()
      })
  }

  openItem (data: any) {
    this.$router.push({
      path: '/admin/edit',
      query: {
        id: data.id
      }
    })
  }
}
</script>

<style lang="scss">
.query-view tr {
  cursor: pointer;
}
</style>
