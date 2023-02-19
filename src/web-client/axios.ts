import http from "http";
import https from "https";
import { AuthenticationType, ConnectionStringProcessor } from "../connection-string";
import { createNtlmClient } from "./auth/ntlm";
import { createOAuthClient } from "./auth/oauth";
import axios, { AxiosRequestConfig } from "axios";
import { OAuthOptions } from "../dataverse-client-options";

export async function createWebClient(connectionString: string, options: OAuthOptions) {
    const connectionStringProcessor = new ConnectionStringProcessor(connectionString);
    const axiosConfig = {
        baseURL: connectionStringProcessor.serviceUri,
        httpsAgent: new https.Agent({ keepAlive: true }),
        httpAgent: new http.Agent({ keepAlive: true }),
        //validateStatus: () => true
    } as AxiosRequestConfig;

    switch (connectionStringProcessor.authType) {
        case AuthenticationType.AD:     return createNtlmClient(connectionStringProcessor, axiosConfig);
        case AuthenticationType.OAuth:  return await createOAuthClient(connectionStringProcessor, axiosConfig, options);

        default: return axios.create(axiosConfig);
    }
}
