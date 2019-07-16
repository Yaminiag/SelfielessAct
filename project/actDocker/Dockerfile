#Use base image
FROM alpine:3.7

#Copy the user code
COPY actsApp act
WORKDIR act

#Install packages
RUN echo http://dl-cdn.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories  \
  && apk upgrade --update \
  && apk add bash \
  && apk add --no-cache mongodb su-exec\
  && apk add supervisor \
  && rm -rf /tmp/* /var/cache/apk/*

RUN apk add --update nodejs nodejs-npm && npm install
# Make /data/db directory
RUN mkdir -p /data/db && \
    chown -R mongodb /data/db

COPY supervisord.conf /etc/supervisord.conf
COPY mongod.conf /etc/mongod.conf

#Make ports available to outside world
EXPOSE 3000
EXPOSE 27017 

#Define Environment Variable
ENV TEAM_ID CC_441_456_457_465

CMD ["node","server.js"]

