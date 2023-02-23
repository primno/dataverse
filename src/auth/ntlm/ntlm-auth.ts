import { AxiosInstance, AxiosRequestConfig, NtlmClient, NtlmCredentials } from "axios-ntlm";
import { Auth } from "../auth";

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

    public createClient(): AxiosInstance {
        return NtlmClient(this.options.credentials, this.axiosConfig);
    }
}