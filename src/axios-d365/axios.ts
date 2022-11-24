import http from "http";
import { AuthenticationType, ConnectionStringProcessor } from "../connnection-string";
import { HttpsAgentWithRootCA } from "./https-agent";
import { createNtlmClient } from "./auth/ntlm";
import { createOAuthClient } from "./auth/oauth";
import axios, { AxiosRequestConfig } from "axios";
import { D365ClientOptions } from "../d365-client";

export async function createAxiosClient(connectionString: string, options: D365ClientOptions) {
    const connectionStringProcessor = new ConnectionStringProcessor(connectionString);
    const axiosConfig = {
        baseURL: connectionStringProcessor.serviceUri,
        httpsAgent: new HttpsAgentWithRootCA({ keepAlive: true }),
        httpAgent: new http.Agent({ keepAlive: true }),
        //validateStatus: () => true
    } as AxiosRequestConfig;

    switch (connectionStringProcessor.authType) {
        case AuthenticationType.AD:     return createNtlmClient(connectionStringProcessor, axiosConfig);
        case AuthenticationType.OAuth:  return await createOAuthClient(connectionStringProcessor, axiosConfig, options.persistence!);

        default: return axios.create(axiosConfig);
    }
}
