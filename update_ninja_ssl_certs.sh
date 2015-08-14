#!/bin/bash

# references:
# https://devcenter.heroku.com/articles/ssl-certificate-self
# https://devcenter.heroku.com/articles/ssl-endpoint#acquire-ssl-certificate
# http://blog.didierstevens.com/2008/12/30/howto-make-your-own-cert-with-openssl/
# http://fereis.eu/ssl-certification-authority-on-linux/

openssl genrsa -des3 -out ca.key 4096
openssl req -subj '/O=ascribe GmbH/CN=*.ascribe.ninja' -new -x509 -days 365 -key ca.key -out ca.crt
openssl genrsa -des3 -out server.pass.key 4096
openssl rsa -in server.pass.key -out server.key
#rm server.pass.key
openssl req -subj '/O=ascribe GmbH/CN=*.ascribe.ninja' -new -key server.key -out server.csr
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt

echo "run the following command to update the certificate on heroku: "
echo
echo "heroku certs:update server.crt server.key --app giano-staging --confirm giano-staging"
echo
