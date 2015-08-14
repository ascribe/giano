#!/bin/bash

# reference: http://fereis.eu/ssl-certification-authority-on-linux/

echo
echo "check certificate basic info ..."
openssl x509 -subject -issuer -enddate -noout -in server.crt

echo
echo "check certificate “useful” info ..."
openssl x509 -in server.crt -noout -text

echo
echo "check certificate is still valid to use on a sslserver ..."
openssl verify -purpose sslserver -CAfile ca.crt server.crt
