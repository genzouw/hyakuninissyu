<template>
  <div>
    <b-navbar
      toggleable="lg"
      class="navbar navbar-expand-lg navbar-dark bg-primary mb-3"
    >
      <router-link class="navbar-brand" to="/"
        >ひゃくにんいっしゅをおぼえよう</router-link>
    </b-navbar>

    <div class="container-fluid">
      <router-view />
    </div>

    <footer
      class="page-footer font-small fixed-bottom bg-light text-dark justify-content-center"
    >
      <div class="footer-copyright text-center py-3">
        <a
          class="twitter-share-button"
          :href="TWITTER_SHARE_URL"
          data-size="large"
          data-text="ひゃくにんいっしゅをおぼえよう"
          data-url="https://hyakuninissyu.genzouw.com"
          >シェア</a>
        <a
          href="https://twitter.com/genzouw"
          class="twitter-follow-button"
          data-size="large"
          data-show-count="false"
          >@genzouw をふぉろー</a>
      </div>
    </footer>
  </div>
</template>

<script>
import { useHead } from '@unhead/vue'
import { TWITTER_SHARE_URL } from './constants/url'

export default {
  name: 'App',
  setup () {
    useHead({
      title: 'ひゃくにんいっしゅをおぼえよう',
      meta: [
        { 'http-equiv': 'Content-Type', content: 'text/html; charset=utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'ひゃくにんいっしゅをおぼえよう。なんもんせいかいできるかな？',
        },
        // OpenGraph
        { property: 'og:title', content: 'ひゃくにんいっしゅをおぼえよう' },
        { property: 'og:site_name', content: 'ひゃくにんいっしゅをおぼえよう' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://hyakuninissyu.genzouw.com' },
        {
          property: 'og:image',
          content: 'https://hyakuninissyu.genzouw.com/hyakunin_issyu.png',
        },
        {
          property: 'og:description',
          content:
            'ひゃくにんいっしゅをおぼえよう。なんもんせいかいできるかな？',
        },
        // Twitter card
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:site', content: '@genzouw' },
        { name: 'twitter:title', content: 'ひゃくにんいっしゅをおぼえよう' },
        {
          name: 'twitter:description',
          content:
            'ひゃくにんいっしゅをおぼえよう。なんもんせいかいできるかな？',
        },
        { name: 'twitter:creator', content: '@genzouw' },
        {
          name: 'twitter:image',
          content: 'https://hyakuninissyu.genzouw.com/hyakunin_issyu.png',
        },
        // Schema.org markup
        { itemprop: 'name', content: 'ひゃくにんいっしゅをおぼえよう' },
        {
          itemprop: 'description',
          content:
            'ひゃくにんいっしゅをおぼえよう。なんもんせいかいできるかな？',
        },
        {
          itemprop: 'image',
          content: 'https://hyakuninissyu.genzouw.com/hyakunin_issyu.png',
        },
        // Site verification
        {
          name: 'google-site-verification',
          content: 'gFYiPUxpzQzAhrVmsACmY-N3Y7jURnIQMfT5GKlnWmU',
        },
      ],
    })

    return {
      TWITTER_SHARE_URL
    }
  },
}
</script>

<style>
body > #app {
  padding: 0;
}

.dropdown-item {
  color: white;
}

.dropdown-item:hover {
  color: black;
}

div.container-fluid {
  margin-bottom: 3em;
}
</style>
