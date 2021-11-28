import http from "http";
import { AuthenticationType, ConnectionStringProcessor } from "../connnection-string";
import { HttpsAgentWithRootCA } from "./https-agent";
import { createNtlmClient } from "./auth/ntlm";
import { createOAuthClient } from "./auth/oauth";
import axios, { AxiosRequestConfig } from "axios";

export async function createAxiosClient(connectionString: string) {
    const connectionStringProcessor = new ConnectionStringProcessor(connectionString);
    const axiosConfig = {
        baseURL: connectionStringProcessor.serviceUri,
        httpsAgent: new HttpsAgentWithRootCA({ keepAlive: true }),
        httpAgent: new http.Agent({ keepAlive: true }),
        //validateStatus: () => true
    } as AxiosRequestConfig;

    switch (connectionStringProcessor.authType) {
        case AuthenticationType.AD:     return createNtlmClient(connectionStringProcessor, axiosConfig);
        case AuthenticationType.OAuth:  return await createOAuthClient(connectionStringProcessor, axiosConfig);

        default: return axios.create(axiosConfig);
    }
}
