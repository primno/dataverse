import { TokenProvider } from "../token-provider";
import { RequestOptions as WebClientRequestOptions, Response as WebClientResponse, WebClient } from "./web-client";
import axios, { AxiosInstance, CreateAxiosDefaults } from "axios";

export interface ErrorResponse {
    errorCode: number;
    message: string;
}

export class AxiosClient implements WebClient {
    protected readonly client: AxiosInstance;

    public constructor(axiosConfig: CreateAxiosDefaults) {
        this.client = axios.create(axiosConfig);
    }

    public setTokenProvider(tokenProvider: TokenProvider): void {
        this.client.interceptors.request.use(async (config) => {
            const token = await tokenProvider.getToken();

            if (token != null && config.headers != null) {
                // HACK: Fix axios header problem. See #5416 in axios repo
                (config.headers as any).Authorization = `Bearer ${token}`;
            }

            return config;
        });
    }

    public async request(config: WebClientRequestOptions): Promise<WebClientResponse> {
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