
# microservice-auth

Simple and lightweight proxy to authenticate requests made to microservices

## How it works

Validate a client certificate passed in header and redirect to a new path. The path can be a docker container and port or an external server.

Proxy expects these headers:
* `x-ssl-cert` - Client certificate in base64 without `BEGIN CERTIFICATE` and `END CERTIFICATE` lines.
* `x-forward-to` - Where to forward the request. Often a value like `container:port`

You probably want to add the headers in Caddy.


## Root certificate

Please see API gateway documentation to get the root certificate. Mount the root certificate in `/certs/ca.crt`.
