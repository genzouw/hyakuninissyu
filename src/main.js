// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import { createApp } from 'vue';
import App from './App';
import router from './router';
import store from './store';
import 'bootstrap/dist/css/bootstrap.css';
import './assets/yeti/bootstrap.min.css';

// GA4 計測タグの注入。GA_ID は webpack DefinePlugin により prod.env.js 経由で
// `vars.GA_ID` (GitHub Actions Repository Variables) の値が静的に埋め込まれる。
// 未設定時は null となり、スクリプトの読み込みおよび設定は行われない。
// dataLayer / gtag は GA_ID の有無に関わらず初期化することで、呼び出し側が
// 環境を意識せずに window.gtag を利用できるようにしている。
// SPA ルート遷移は GA4 の Enhanced Measurement (History API) で自動計測される。
window.dataLayer = window.dataLayer || [];
window.gtag = function gtag() {
  window.dataLayer.push(arguments);
};
if (process.env.GA_ID) {
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.GA_ID}`;
  document.head.appendChild(gaScript);

  window.gtag('js', new Date());
  window.gtag('config', process.env.GA_ID);
}

const app = createApp(App);
app.use(router);
app.use(store);
app.mount('#app');
