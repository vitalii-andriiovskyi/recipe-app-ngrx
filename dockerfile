FROM node:12 AS base-node
WORKDIR /usr/src/recipe-app-ngrx
COPY ./ ./
# RUN npm install

FROM nginx:alpine AS recipe-web
COPY /nginx/nginx.conf /etc/nginx/nginx.conf
WORKDIR /usr/share/nginx/html
COPY --from=base-node /usr/src/recipe-app-ngrx/dist/apps/recipe-app .
CMD ["nginx", "-g", "daemon off;"]

FROM mongo AS mongo-db
ADD /mongodb/data/db/ /data/db/
ADD /mongodb/initdb.d/ /docker-entrypoint-initdb.d/

FROM node:12 AS recipe-api
WORKDIR /usr/src/recipe-api
COPY --from=base-node /usr/src/recipe-app-ngrx .
RUN yarn config set unsafe-perm true && yarn
RUN npm install -g @angular/cli --unsafe-perm && ng config -g cli.packageManager yarn
CMD ["/bin/bash"]
