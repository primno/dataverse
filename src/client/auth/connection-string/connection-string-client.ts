import { NtlmClient } from "../ntlm";
import { discoverAuthority } from "../oauth/authority";
import { OAuthClient, OAuthConfig } from "../oauth";
import { DeviceCodeResponse } from "@azure/msal-common";
import { convertToOAuth2Credential } from "./converter/oauth-converter";
import { RequestOptions, Response, WebClient } from "../../web-client";
import { AuthenticationType, ConnectionString } from "./connection-string";
import { convertToNetworkCredential } from "./converter/ntlm-converter";

/**
 * Persistence options.
 * Persistence is enabled when `AuthType` is `OAuth` and `TokenCacheStorePath` is set in connection string.
 */
interface PersistenceOptions {
    serviceName: string;
    accountName: string;
}

/**
 * Options for OAuth2 authentication
 */
interface OAuth2Options {
    /**
     * Persistence options
     */
    persistence: PersistenceOptions;

    /**
     * Device code callback. Only used when grant_type is device_code.
     * @param response The device code response
     * @returns 
     */
    deviceCodeCallback?: (response: DeviceCodeResponse) => void;
}

/**
 * Options for connection string authentication.
 */
export interface ConnectionStringOptions {
    oAuth: OAuth2Options;
}

/**
 * Provides web client for connection string authentication.
 */
export class ConnectionStringClient implements WebClient {
    private csp: ConnectionString;
    private webClient: WebClient | undefined;

    /**
     * Creates a new instance of ConnStringClientProvider.
     * Supported authentication types: AD, OAuth.
     * @param connectionString Connection string as string or ConnectionString object.
     * @param options Options for connection string authentication.
     */
    constructor(
        connectionString: string | ConnectionString,
        private options: ConnectionStringOptions
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

    private async getWebClient(): Promise<WebClient> {
        if (this.webClient == null) {
            switch (this.csp.authType) {
                case AuthenticationType.AD:
                    {
                        const credentials = convertToNetworkCredential(this.csp);
                        return new NtlmClient({
                            credentials,
                            url: this.csp.serviceUri as string
                        });
                    }
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
                                ...this.options.oAuth.persistence
                            },
                            deviceCodeCallback: this.options.oAuth.deviceCodeCallback,
                            url: this.csp.serviceUri as string
                        };
                        return new OAuthClient(options);
                    }
                default: throw new Error("Unsupported authentication type");
            }
        }
        return this.webClient;
    }

    public async request(config: RequestOptions): Promise<Response> {
        const webClient = await this.getWebClient();
        return webClient.request(config);
    }
}