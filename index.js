const http = require('http')
const fs = require('fs')
const pki = require('node-forge').pki

const ca = fs.readFileSync('/certs/ca.crt')
const caStore = pki.createCaStore([pki.certificateFromPem(ca)])

const PORT = process.env.PORT || 8081
const DEBUG = process.env.DEBUG

const getCert = (headers) => `
-----BEGIN CERTIFICATE-----
${headers['x-ssl-cert']}
-----END CERTIFICATE-----
`

const onRequest = (clientReq, clientRes) => {
    const { url: path, method, headers } = clientReq
    if (DEBUG) console.log('Serve', method, path, headers)

    try {
        const cert = getCert(headers)
        if (DEBUG) console.log('cert', cert)
        pki.verifyCertificateChain(caStore, [pki.certificateFromPem(cert)])
    } catch (e) {
        console.error(e)
        console.log(JSON.stringify(headers))
        clientRes.writeHead(401)
        return clientRes.end(`Invalid client certificate in header x-ssl-cert: ${e.message}`)
    }

    if (!headers['x-forward-to']) {
        console.error("Missing x-forward-to")
        clientRes.writeHead(500)
        return clientRes.end(`Missing host in header x-forward-to`)
    }

    const [hostname, port = 80] = headers['x-forward-to'].split(':')
    delete headers['x-forward-to']
    const options = { hostname, port, path, method, headers }

    const proxy = http.request(options, (res) => {
        clientRes.writeHead(res.statusCode, res.headers)
        res.pipe(clientRes, {
            end: true
        })
    })

    clientReq.pipe(proxy, { end: true })
}

http.createServer(onRequest).listen(PORT)
console.log(`client auth listening on port ${PORT}`)
