import axios from "axios";
import { Auth, WebClient } from "../auth";
import { AxiosWrapper } from "../axios-wrapper";
import { getTokenProvider } from "./msal/token/provider";
import { OAuthConfig } from "./oauth-configuration";

/**
 * Provides OAuth2 authentication.
 */
export class OAuth implements Auth {
    public constructor(
        private oAuth2Config: OAuthConfig
        ) {}

    public async createClient(): Promise<WebClient> {
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

        return new AxiosWrapper(client);
    }
}