import { AxiosInstance } from "axios";
import { RequestOptions, WebClient, Response } from "./client-provider";

interface ErrorResponse {
    errorCode: number;
    message: string;
}

export class AxiosClientWrapper implements WebClient {
    public constructor(private client: AxiosInstance) {}

    public async request(config: RequestOptions): Promise<Response> {
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