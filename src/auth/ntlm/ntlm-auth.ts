import { AxiosRequestConfig, NtlmClient, NtlmCredentials } from "axios-ntlm";
import { Auth, WebClient } from "../auth";
import { AxiosWrapper } from "../axios-wrapper";

export interface NtlmOptions {
    credentials: NtlmCredentials;
    url: string;
}

export class NtlmAuth implements Auth {
    private axiosConfig: AxiosRequestConfig;

    public constructor(private options: NtlmOptions) {
        this.axiosConfig = {
            baseURL: options.url
        };
    }

    public createClient(): WebClient {
        return new AxiosWrapper(NtlmClient(this.options.credentials, this.axiosConfig));
    }
}