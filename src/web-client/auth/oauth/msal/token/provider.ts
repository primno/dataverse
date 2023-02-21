import { AuthenticationResult, IConfidentialClientApplication, IPublicClientApplication } from "@azure/msal-node";
import { OAuth2Config } from "../../oauth2-configuration";
import { Application, createApplication } from "./application";

export interface TokenProvider {
    getToken(): Promise<string>;
}

abstract class MsalTokenProvider<T extends IConfidentialClientApplication | IPublicClientApplication> implements TokenProvider {
    private client: T | undefined;

    constructor(
        protected oAuthOptions: OAuth2Config,
        protected supportedApplication: Application["type"][]) {
    }

    protected async getClient(): Promise<T> {
        if (this.client == null) {
            const application = await createApplication(this.oAuthOptions);
            if (!this.supportedApplication.includes(application.type)) {
                throw new Error(`Unsupported application type: ${application.type}`);
            }

            this.client = application.client as any;
        }

        return this.client!;
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

        super(oAuthOptions, ["public"]);
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

class UserPasswordTokenProvider extends MsalTokenProvider<IConfidentialClientApplication | IPublicClientApplication> {
    constructor(oAuthOptions: OAuth2Config) {
        if (oAuthOptions.credentials.username == null || oAuthOptions.credentials.password == null) {
            throw new Error("Username and password are required for password flow");
        }

        super(oAuthOptions,  ["confidential", "public"]);
    }
    
    async acquireToken(client: IPublicClientApplication | IConfidentialClientApplication): Promise<AuthenticationResult | null> {
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

        super(oAuthOptions, ["confidential"]);
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