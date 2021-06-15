FROM node:10 as builder
RUN mkdir /usr/local/app
ADD . /usr/local/app
WORKDIR /usr/local/app
RUN npm install -g @angular/cli && npm install --force
RUN npm rebuild node-sass
RUN ng build --prod="true"

FROM nginx
COPY --from=builder /usr/local/app/dist/sisc-decision-support-tool2 /usr/share/nginx/html/
RUN ls /usr/share/nginx/html/
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
