import { AuthenticationType, ConnectionStringProcessor } from "../connection-string";
import { NtlmAuth, convertToNetworkCredential } from "./ntlm";
import { AxiosInstance, AxiosRequestConfig } from "axios";
import { Auth } from "./auth";
import { discoverAuthority } from "./oauth/authority";
import { OAuth, OAuth2Config, PersistenceOptions } from "./oauth";
import { DeviceCodeResponse } from "@azure/msal-common";
import { convertToOAuth2Credential } from "./oauth/connection-string-converter";

/**
 * Options for OAuth2 authentication
 */
interface OAuth2Options {
    /**
     * The persistence options
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
 * Options for connection string authentication
 */
export interface ConnectionStringOptions {
    oAuth: OAuth2Options;
}

/**
 * Authentication using connection string
 */
export class ConnectionStringAuth implements Auth {
    private csp: ConnectionStringProcessor;
    private authenticator: Auth | undefined;

    constructor(private connectionString: string, private options: ConnectionStringOptions) {
        this.csp = new ConnectionStringProcessor(this.connectionString);
    }

    private async getAuthenticator(): Promise<Auth> {
        if (!this.authenticator) {
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
                            persistence: this.options.oAuth.persistence,
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

    public async createClient(): Promise<AxiosInstance> {
        const authenticator = await this.getAuthenticator();
        return authenticator.createClient();
    }
}