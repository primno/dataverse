import {
    INetworkModule,
    NetworkRequestOptions,
    NetworkResponse,
} from "@azure/msal-common";
import axios, { AxiosRequestConfig } from "axios";
import { HttpsAgentWithRootCA } from "../../../https-agent";

/**
 * This class implements the API for network requests.
 */
export class AxiosNetworkModule implements INetworkModule {
    constructor() {
        axios.defaults.validateStatus = () => true;
    }

    /**
     * Http Get request
     * @param url
     * @param options
     */
    async sendGetRequestAsync<T>(
        url: string,
        options?: NetworkRequestOptions
    ): Promise<NetworkResponse<T>> {
        const request: AxiosRequestConfig = {
            method: "get",
            url: url,
            headers: options && options.headers,
            httpsAgent: new HttpsAgentWithRootCA()
        };

        const response = await axios(request);
        return {
            headers: response.headers,
            body: response.data as T,
            status: response.status,
        };
    }

    /**
     * Http Post request
     * @param url
     * @param options
     */
    async sendPostRequestAsync<T>(
        url: string,
        options?: NetworkRequestOptions
    ): Promise<NetworkResponse<T>> {
        const request: AxiosRequestConfig = {
            method: "post",
            url: url,
            data: (options && options.body) || "",
            headers: options && options.headers,
            httpsAgent: new HttpsAgentWithRootCA()
        };

        const response = await axios(request);
        return {
            headers: response.headers,
            body: response.data as T,
            status: response.status,
        };
    }
}