const ca = require("win-ca");

let rootCerts: string[] = [];
let loaded: boolean = false;

export function getRootCertificates(): string[] {
    if (!loaded) {
        ca({
            format: ca.der2.pem,
            store: ['root', 'ca',],
            ondata: rootCerts
        });
        loaded = true;
    }

    return rootCerts;
}