import { AxiosInstance, AxiosRequestConfig } from "axios";
import { NtlmCredentials, NtlmClient } from "axios-ntlm";
import { ConnectionStringProcessor } from "../../../connection-string";

function convertToNetworkCredential(connectionString: ConnectionStringProcessor) {
    return { 
        password: connectionString.password,
        username: connectionString.userName,
        domain: connectionString.domain} as NtlmCredentials
}

export function createNtlmClient(connectionStringProcessor: ConnectionStringProcessor, axiosConfig: AxiosRequestConfig) {
    const credentials = convertToNetworkCredential(connectionStringProcessor);
    return NtlmClient(credentials, axiosConfig as any) as AxiosInstance;
}