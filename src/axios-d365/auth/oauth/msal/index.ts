import axios, { AxiosRequestConfig, AxiosInstance } from "axios";
import { OAuth2Config } from "../oauth2-configuration";
import { getToken } from "./token";

/**
 * Create a axios client that uses MSAL to get an access token
 * @param oauthOptions 
 * @param axiosConfig 
 * @returns 
 */
export function createMsalClient(oauthOptions: OAuth2Config, axiosConfig: AxiosRequestConfig): AxiosInstance {
    const client = axios.create(axiosConfig);
    client.interceptors.request.use(async (config) => {
        const accessToken = await getToken(oauthOptions);
        if (accessToken) {
            if (config.headers != null) {
                // HACK: Fix axios header problem. See #5416 in axios repo
                (config.headers as any).Authorization = `Bearer ${accessToken}`;
            }
        }

        return config;
    });

    return client;
}
