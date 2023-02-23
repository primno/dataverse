import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Auth } from "../auth";
import { getTokenProvider } from "./msal/token/provider";
import { OAuth2Config } from "./oauth2-configuration";

/**
 * Provides OAuth2 authentication.
 */
export class OAuth implements Auth {
    public constructor(
        private oAuth2Config: OAuth2Config
        ) {}

    public async createClient(): Promise<AxiosInstance> {
        const client = axios.create({
            baseURL: this.oAuth2Config.url
        });
        const tokenProvider = getTokenProvider(this.oAuth2Config);

        client.interceptors.request.use(async (config) => {
            const accessToken = await tokenProvider.getToken();
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
}