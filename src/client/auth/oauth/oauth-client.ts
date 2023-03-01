import { AxiosClient } from "../../axios-client";
import { getTokenProvider } from "./msal/token/provider";
import { OAuthConfig } from "./oauth-configuration";

/**
 * Provides OAuth2 authentication.
 */
export class OAuthClient extends AxiosClient {
    public constructor(
        private oAuth2Config: OAuthConfig
    ) {
        super({
            baseURL: oAuth2Config.url
        });

        const tokenProvider = getTokenProvider(this.oAuth2Config);

        this.client.interceptors.request.use(async (config) => {
            const accessToken = await tokenProvider.getToken();
            if (accessToken) {
                if (config.headers != null) {
                    // HACK: Fix axios header problem. See #5416 in axios repo
                    (config.headers as any).Authorization = `Bearer ${accessToken}`;
                }
            }

            return config;
        });
    }
}