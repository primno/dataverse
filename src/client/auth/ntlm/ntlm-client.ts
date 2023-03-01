import { AxiosInstance, NtlmClient as AxiosNtlmClient, NtlmCredentials } from "axios-ntlm";
import { ErrorResponse } from "../../axios-client";
import { RequestOptions, WebClient } from "../../web-client";

export interface NtlmOptions {
    credentials: NtlmCredentials;
    url: string;
}

export class NtlmClient implements WebClient {
    private client: AxiosInstance;

    public constructor(private options: NtlmOptions) {
        const axiosConfig = {
            baseURL: options.url
        };

        this.client = AxiosNtlmClient(options.credentials, axiosConfig);
    }

    public async request(config: RequestOptions): Promise<any> {
        try {
            return await this.client.request(config);
        }
        catch (except: any) {
            if (except.isAxiosError) {
                const data = except.response.data;
                if (data.error != null) {
                    const errorResponse = data.error as ErrorResponse;
                    throw new Error(errorResponse.message);
                }
            }

            throw new Error(except.message);
        }
    }
}