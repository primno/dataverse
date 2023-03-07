import { TokenProvider } from "../token-provider";
import { ClientCredentialTokenProvider, DeviceCodeTokenProvider, UserPasswordTokenProvider } from "./msal/token/provider";
import { OAuthConfig } from "./oauth-configuration";

/**
 * Provides OAuth2 authentication.
 */
export class OAuthTokenProvider implements TokenProvider {
    private tokenProvider: TokenProvider;

    public constructor(
        oAuthConfig: OAuthConfig
    ) {
        this.tokenProvider = this.getTokenProvider(oAuthConfig);
    }

    private getTokenProvider(oAuth2Config: OAuthConfig): TokenProvider {
        switch (oAuth2Config.credentials.grantType) {
            case "device_code":
                return new DeviceCodeTokenProvider(oAuth2Config);
            case "password":
                return new UserPasswordTokenProvider(oAuth2Config);
            case "client_credential":
                return new ClientCredentialTokenProvider(oAuth2Config);
                
            default: throw new Error("Invalid grant type");
        }
    }

    public get url(): string {
        return this.tokenProvider.url;
    }

    public async getToken(): Promise<string> {
        return this.tokenProvider.getToken();
    }
}