import { AuthenticationType, ConnectionString } from "../connection-string";
import { NtlmAuth, convertToNetworkCredential } from "./ntlm";
import { Auth, WebClient } from "./auth";
import { discoverAuthority } from "./oauth/authority";
import { OAuth, OAuth2Config } from "./oauth";
import { DeviceCodeResponse } from "@azure/msal-common";
import { convertToOAuth2Credential } from "./oauth/connection-string-converter";

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
 * Authentication using connection string.
 */
export class ConnectionStringAuth implements Auth {
    private csp: ConnectionString;
    private authenticator: Auth | undefined;

    /**
     * Creates a new instance of ConnectionStringAuth.
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

    private async getAuthenticator(): Promise<Auth> {
        if (this.authenticator == null) {
            switch (this.csp.authType) {
                case AuthenticationType.AD:
                    {
                        const credentials = convertToNetworkCredential(this.csp);
                        this.authenticator = new NtlmAuth({
                            credentials,
                            url: this.csp.serviceUri as string
                        });
                        break;
                    }
                case AuthenticationType.OAuth:
                    {
                        const authority = await discoverAuthority(this.csp.serviceUri as string);
                        const credentials = convertToOAuth2Credential(this.csp, authority);
                        const options: OAuth2Config = {
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
                        this.authenticator = new OAuth(options);
                        break;
                    }
                default: throw new Error("Unsupported authentication type");
            }
        }

        return this.authenticator;
    }

    public async createClient(): Promise<WebClient> {
        const authenticator = await this.getAuthenticator();
        return authenticator.createClient();
    }
}