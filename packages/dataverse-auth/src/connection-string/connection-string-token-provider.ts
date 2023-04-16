import { discoverAuthority } from "../oauth/authority";
import { OAuthTokenProvider, OAuthConfig } from "../oauth";
import { DeviceCodeResponse } from "@azure/msal-common";
import { convertToOAuth2Credential } from "./converter/oauth-converter";
import { AuthenticationType, ConnectionString } from "./connection-string";
import { TokenProvider } from "../token-provider";

/**
 * Persistence options.
 * Persistence is enabled when `AuthType` is `OAuth` and `TokenCacheStorePath` is set in connection string.
 */
interface PersistenceOptions {
    /**
     * Service name. Used by Linux and macOS keychain.
     * @default "Primno.DataverseClient"
     */
    serviceName?: string;
    /**
     * Account name. Used by Linux and macOS keychain.
     * @default "MSALCache"
     */
    accountName?: string;
}

/**
 * Options for OAuth2 authentication
 */
interface OAuthOptions {
    /**
     * Persistence options.
     * Persistence is enabled when `AuthType` is `OAuth` and `TokenCacheStorePath` is set in connection string.
     */
    persistence?: PersistenceOptions;

    /**
     * Device code callback. Only used when grant_type is device_code.
     * @param response The device code response
     */
    deviceCodeCallback?: (response: DeviceCodeResponse) => void;
}

/**
 * Options for connection string authentication.
 */
export interface ConnectionStringOptions {
    oAuth?: OAuthOptions;
}

/**
 * Provides a token from a connection string.
 */
export class ConnStringTokenProvider implements TokenProvider {
    private csp: ConnectionString;
    private tokenProvider: TokenProvider | undefined;

    /**
     * Creates a new instance of ConnStringClientProvider.
     * Supported authentication types: OAuth.
     * @param connectionString Connection string as string or ConnectionString object.
     * @param options Options for connection string authentication.
     */
    constructor(
        connectionString: string | ConnectionString,
        private options?: ConnectionStringOptions
    ) {
        if (typeof connectionString === "string") {
            this.csp = new ConnectionString(connectionString);
        } else if (connectionString instanceof ConnectionString) {
            this.csp = connectionString;
        }
        else {
            throw new Error("Invalid connection string");
        }

        if (this.csp.serviceUri == null) {
            throw new Error("Service URI is missing");
        }

        if (this.csp.authType == null) {
            throw new Error("Authentication type is missing");
        }
    }

    public get url(): string {
        return this.csp.serviceUri!;
    }

    private async getTokenProvider(): Promise<TokenProvider> {
        if (this.tokenProvider == null) {
            switch (this.csp.authType) {
                case AuthenticationType.OAuth:
                    {
                        const authority = await discoverAuthority(this.csp.serviceUri as string);
                        const credentials = convertToOAuth2Credential(this.csp, authority);
                        const options: OAuthConfig = {
                            credentials,
                            persistence: {
                                // Persistence is enabled only when the cache path is specified
                                enabled: this.csp.tokenCacheStorePath != null,
                                cachePath: this.csp.tokenCacheStorePath!,
                                ...this.options?.oAuth?.persistence,
                            },
                            deviceCodeCallback: this.options?.oAuth?.deviceCodeCallback,
                            url: this.csp.serviceUri!
                        };

                        this.tokenProvider = new OAuthTokenProvider(options);
                        break;
                    }
                default: throw new Error("Unsupported authentication type");
            }
        }

        return this.tokenProvider;
    }

    public async getToken(): Promise<string> {
        const tokenProvider = await this.getTokenProvider();
        return await tokenProvider.getToken();
    }
}