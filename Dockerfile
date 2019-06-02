FROM genzouw/centos-sandbox

RUN npm install -g vue-cli \
  && npm install -g @vue/cli-service-global \
  && mkdir -p /apps
