<template>
  <div>
    <b-navbar
      toggleable="lg"
      class="navbar navbar-expand-lg navbar-dark bg-primary mb-3"
    >
      <router-link class="navbar-brand" to="/"
        >ひゃくにんいっしゅをおぼえよう</router-link
      >
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
          href="//twitter.com/intent/tweet?text=%E3%80%8C%E3%81%B2%E3%82%83%E3%81%8F%E3%81%AB%E3%82%93%E3%81%84%E3%81%A3%E3%81%97%E3%82%85%E3%82%92%E3%81%8A%E3%81%BC%E3%81%88%E3%82%88%E3%81%86%E3%80%8D%E3%81%A7%E7%99%BE%E4%BA%BA%E4%B8%80%E9%A6%96%E3%82%92%E6%A5%BD%E3%81%97%E3%81%8F%E5%AD%A6%E3%81%BC%E3%81%86%EF%BC%81%0A%23%E3%81%B2%E3%82%83%E3%81%8F%E3%81%AB%E3%82%93%E3%81%84%E3%81%A3%E3%81%97%E3%82%85+%23%E7%99%BE%E4%BA%BA%E4%B8%80%E9%A6%96+%23%E6%97%A5%E6%9C%AC%E8%AA%9E+%23%E5%8F%A4%E5%85%B8%0A%0A"
          data-size="large"
          data-text="ひゃくにんいっしゅをおぼえよう"
          data-url="https://hyakuninissyu.genzouw.com"
          >シェア</a
        >
        <a
          href="//twitter.com/genzouw"
          class="twitter-follow-button"
          data-size="large"
          data-show-count="false"
          >@genzouw をふぉろー</a
        >
      </div>
    </footer>
  </div>
</template>

<script>
import { useHead } from '@unhead/vue'

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
        { name: 'twitter:site', content: 'https://hyakuninissyu.genzouw.com' },
        { name: 'twitter:title', content: 'ひゃくにんいっしゅをおぼえよう' },
        {
          name: 'twitter:description',
          content:
            'ひゃくにんいっしゅをおぼえよう。なんもんせいかいできるかな？',
        },
        { name: 'twitter:creator', content: '@genzouw' },
        {
          name: 'twitter:image:src',
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
