import https from "https";
import { getRootCertificates } from "./certificate";

export class HttpsAgentWithRootCA extends https.Agent {
    constructor(options: https.AgentOptions = {}) {
        if (process.platform === "win32") {
            options.ca = getRootCertificates();
        }
        super(options);
    }
}