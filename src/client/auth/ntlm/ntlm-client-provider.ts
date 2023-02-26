import { AxiosRequestConfig, NtlmClient, NtlmCredentials } from "axios-ntlm";
import { AxiosClientWrapper } from "../../axios-client-wrapper";
import { ClientProvider, WebClient } from "../../client-provider";

export interface NtlmOptions {
    credentials: NtlmCredentials;
    url: string;
}

export class NtlmClientProvider implements ClientProvider {
    private axiosConfig: AxiosRequestConfig;

    public constructor(private options: NtlmOptions) {
        this.axiosConfig = {
            baseURL: options.url
        };
    }

    public createClient(): WebClient {
        return new AxiosClientWrapper(NtlmClient(this.options.credentials, this.axiosConfig));
    }
}