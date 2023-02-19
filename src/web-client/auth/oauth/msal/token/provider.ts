import { AuthenticationResult, ConfidentialClientApplication, IConfidentialClientApplication, IPublicClientApplication, LogLevel, PublicClientApplication } from "@azure/msal-node";
import { OAuth2Config } from "../../oauth2-configuration";
import { AxiosNetworkModule } from "../axios-network-module";
import { getCacheOptions } from "./cache";

export interface TokenProvider {
    getToken(): Promise<string>;
}

abstract class MsalTokenProvider<T extends IConfidentialClientApplication | IPublicClientApplication> implements TokenProvider {
    protected oAuthOptions: OAuth2Config;
    private client: T | undefined;

    constructor(oAuthOptions: OAuth2Config, private clientType: "public" | "confidential") {
        this.oAuthOptions = oAuthOptions;
    }

    protected async getClient(): Promise<T> {
        if (this.client == null) {
            this.client = await this.createApplication();
        }
        return this.client;
    }

    private async createApplication(): Promise<T> {
        const { credentials, persistence } = this.oAuthOptions;

        const options = {
            auth: {
                clientId: credentials.client_id,
                authority: credentials.url,
                clientSecret: credentials.client_secret,
                knownAuthorities: [credentials.url]
            },
            system: {
                networkClient: new AxiosNetworkModule(),
                loggerOptions: {
                    loggerCallback() {
                        //console.log(message);
                    },
                    logLevel: LogLevel.Verbose,
                    piiLoggingEnabled: false
                }
            },
            cache: persistence.enabled ? await getCacheOptions(persistence) : undefined
        };

        switch (this.clientType) {
            case "public":
                return new PublicClientApplication(options) as any;
            case "confidential":
                return new ConfidentialClientApplication(options) as any;
            default:
                throw new Error("Invalid client type");
        }
    }

    abstract acquireToken(client: T): Promise<AuthenticationResult | null>;

    public async getToken(): Promise<string> {
        const client = await this.getClient();

        try {
            const { scope, username } = this.oAuthOptions.credentials;

            const tokenCache = client.getTokenCache();
            const accounts = await tokenCache.getAllAccounts();
    
            // TODO: Fix
            const account = accounts.find(a => a.username.toLocaleLowerCase() === username!.toLocaleLowerCase());
    
            const result = await client.acquireTokenSilent(
                {
                    scopes: [scope!],
                    account: account!
                }
            );

            if (result == null) {
                throw new Error("Unable to acquire token silently");
            }

            return result.accessToken;
        }
        catch (except) {
            const result = await this.acquireToken(client);

            if (result == null) {
                throw new Error("Unable to acquire token");
            }

            return result.accessToken;
        }
    }
}

class DeviceCodeTokenProvider extends MsalTokenProvider<IPublicClientApplication> {
    constructor(oAuthOptions: OAuth2Config) {
        if (oAuthOptions.deviceCodeCallback == null) {
            throw new Error("Device code callback is required for device code flow");
        }

        super(oAuthOptions, "public");
    }
    
    async acquireToken(client: IPublicClientApplication): Promise<AuthenticationResult | null> {
        const { scope } = this.oAuthOptions.credentials;
        const { deviceCodeCallback } = this.oAuthOptions;

        return await client.acquireTokenByDeviceCode({
            scopes: [scope as string],
            deviceCodeCallback: deviceCodeCallback!
        });
    }
}

class UserPasswordTokenProvider extends MsalTokenProvider<IPublicClientApplication> {
    constructor(oAuthOptions: OAuth2Config) {
        if (oAuthOptions.credentials.username == null || oAuthOptions.credentials.password == null) {
            throw new Error("Username and password are required for password flow");
        }

        super(oAuthOptions, "public");
    }
    
    async acquireToken(client: IPublicClientApplication): Promise<AuthenticationResult | null> {
        const { scope, username, password } = this.oAuthOptions.credentials;

        return await client.acquireTokenByUsernamePassword({
            scopes: [scope!],
            username: username!,
            password: password!
        });
    }
}

class ClientCredentialTokenProvider extends MsalTokenProvider<IConfidentialClientApplication> {
    constructor(oAuthOptions: OAuth2Config) {
        if (oAuthOptions.credentials.client_id == null || oAuthOptions.credentials.client_secret == null) {
            throw new Error("Client ID and secret are required for client credential flow");
        }

        super(oAuthOptions, "confidential");
    }
    
    async acquireToken(client: IConfidentialClientApplication): Promise<AuthenticationResult | null> {
        const { scope } = this.oAuthOptions.credentials;

        return await client.acquireTokenByClientCredential({
            scopes: [scope!]
        });
    }
}

export function getTokenProvider(oAuthOptions: OAuth2Config): TokenProvider {
    switch (oAuthOptions.credentials.grant_type) {
        case "device_code":
            return new DeviceCodeTokenProvider(oAuthOptions);
        case "password":
            return new UserPasswordTokenProvider(oAuthOptions);
        case "client_credential":
            return new ClientCredentialTokenProvider(oAuthOptions);
            
        default: throw new Error("Invalid grant type");
    }
}