<template>
  <div class="container-fluid" id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-3">
      <router-link class="navbar-brand" to="/"><h1>ひゃくにんいっしゅをおぼえよう</h1></router-link>


      <a class="twitter-share-button" href="//twitter.com/intent/tweet?text=%E3%80%8C%E3%81%B2%E3%82%83%E3%81%8F%E3%81%AB%E3%82%93%E3%81%84%E3%81%A3%E3%81%97%E3%82%85%E3%82%92%E3%81%8A%E3%81%BC%E3%81%88%E3%82%88%E3%81%86%E3%80%8D%E3%81%A7%E7%99%BE%E4%BA%BA%E4%B8%80%E9%A6%96%E3%82%92%E6%A5%BD%E3%81%97%E3%81%8F%E5%AD%A6%E3%81%BC%E3%81%86%EF%BC%81%0A%23%E3%81%B2%E3%82%83%E3%81%8F%E3%81%AB%E3%82%93%E3%81%84%E3%81%A3%E3%81%97%E3%82%85+%23%E7%99%BE%E4%BA%BA%E4%B8%80%E9%A6%96+%23%E6%97%A5%E6%9C%AC%E8%AA%9E+%23%E5%8F%A4%E5%85%B8%0A%0A" data-size="large" data-text="ひゃくにんいっしゅをおぼえよう" data-url="https://hyakuninissyu.genzouw.com">しぇあ</a>

          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Dropdown
            </a>
            <div class="dropdown-menu" aria-labelledby="navbarDropdown">
            <a class="dropdown-item" href="#">Action</a>
            <a class="dropdown-item" href="#">Another action</a>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#">Something else here</a>
            </div>
          </li>
          <li class="nav-item">
            <a class="nav-link disabled" href="#">Disabled</a>
          </li>
        </ul>
        <form class="form-inline my-2 my-lg-0">
          <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
          <button class="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
        </form>
      </div>
    </nav>

    <router-view/>

    <footer class="page-footer font-small fixed-bottom bg-light text-dark justify-content-center">
      <div class="footer-copyright text-center py-3">
        <a class="twitter-share-button" href="//twitter.com/intent/tweet?text=%E3%80%8C%E3%81%B2%E3%82%83%E3%81%8F%E3%81%AB%E3%82%93%E3%81%84%E3%81%A3%E3%81%97%E3%82%85%E3%82%92%E3%81%8A%E3%81%BC%E3%81%88%E3%82%88%E3%81%86%E3%80%8D%E3%81%A7%E7%99%BE%E4%BA%BA%E4%B8%80%E9%A6%96%E3%82%92%E6%A5%BD%E3%81%97%E3%81%8F%E5%AD%A6%E3%81%BC%E3%81%86%EF%BC%81%0A%23%E3%81%B2%E3%82%83%E3%81%8F%E3%81%AB%E3%82%93%E3%81%84%E3%81%A3%E3%81%97%E3%82%85+%23%E7%99%BE%E4%BA%BA%E4%B8%80%E9%A6%96+%23%E6%97%A5%E6%9C%AC%E8%AA%9E+%23%E5%8F%A4%E5%85%B8%0A%0A" data-size="large" data-text="ひゃくにんいっしゅをおぼえよう" data-url="https://hyakuninissyu.genzouw.com">しぇあ</a>
        <a href="//twitter.com/genzouw" class="twitter-follow-button" data-size="large" data-show-count="false">@genzouw をふぉろー</a>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  metaInfo: {
    title: 'ひゃくにんいっしゅをおぼえよう',
    // Define meta tags here.
    meta: [
      {
        'http-equiv': 'Content-Type', content: 'text/html; charset=utf-8'
      },
      {
        name: 'viewport', content: 'width=device-width, initial-scale=1'
      },
      {
        name: 'description', content: 'みんなでたのしく「ひゃくにんいっしゅをおぼえよう」！'
      },
      // OpenGraph data (Most widely used)
      {
        property: 'og:title', content: 'ひゃくにんいっしゅをおぼえよう'
      },
      {
        property: 'og:site_name', content: 'ひゃくにんいっしゅをおぼえよう'
      },
      // The list of types is available here: http://ogp.me/#types
      {
        property: 'og:type', content: 'website'
      },
      // Should the the same as your canonical link, see below.
      {
        property: 'og:url', content: 'https://hyakuninissyu.genzouw.com'
      },
      {
        property: 'og:image', content: 'https://hyakuninissyu.genzouw.com/static/hyakunin_issyu.png'
      },
      // Often the same as your meta description, but not always.
      {
        property: 'og:description', content: 'みんなでたのしく「ひゃくにんいっしゅをおぼえよう」！'
      },
      // Twitter card
      {
        name: 'twitter:card', content: 'summary'
      },
      {
        name: 'twitter:site', content: 'https://hyakuninissyu.genzouw.com'
      },
      {
        name: 'twitter:title', content: 'ひゃくにんいっしゅをおぼえよう'
      },
      {
        name: 'twitter:description', content: 'みんなでたのしく「ひゃくにんいっしゅをおぼえよう」！'
      },
      // Your twitter handle, if you have one.
      {
        name: 'twitter:creator', content: '@genzouw'
      },
      {
        name: 'twitter:image:src', content: 'https://hyakuninissyu.genzouw.com/static/hyakunin_issyu.png'
      },

      // Google / Schema.org markup:
      {
        itemprop: 'name', content: 'ひゃくにんいっしゅをおぼえよう'
      },
      {
        itemprop: 'description', content: 'みんなでたのしく「ひゃくにんいっしゅをおぼえよう」！'
      },
      {
        itemprop: 'image', content: 'https://hyakuninissyu.genzouw.com/static/hyakunin_issyu.png'
      }
    ]
  }
}
</script>

<style scoped>
h1 {
  font-size: 100%;
}

body > #app {
  padding: 0;
}

</style>
