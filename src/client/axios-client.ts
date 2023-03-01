import { RequestOptions, Response, WebClient } from "./web-client";
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

    async request(config: RequestOptions): Promise<Response> {
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