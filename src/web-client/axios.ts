import http from "http";
import https from "https";
import { AuthenticationType, ConnectionStringProcessor } from "../connection-string";
import { createNtlmClient } from "./auth/ntlm";
import { createOAuthClient } from "./auth/oauth";
import { AxiosRequestConfig } from "axios";
import { OAuthOptions } from "../dataverse-client-options";

export async function createWebClient(connectionString: string, options: OAuthOptions) {
    const connectStringProc = new ConnectionStringProcessor(connectionString);

    const axiosConfig = {
        baseURL: connectStringProc.serviceUri,
        httpsAgent: new https.Agent({ keepAlive: true }),
        httpAgent: new http.Agent({ keepAlive: true })
    } as AxiosRequestConfig;

    switch (connectStringProc.authType) {
        case AuthenticationType.AD: return createNtlmClient(connectStringProc, axiosConfig);
        case AuthenticationType.OAuth: return await createOAuthClient(connectStringProc, axiosConfig, options);
        default: throw new Error("Unsupported authentication type");
    }
}
