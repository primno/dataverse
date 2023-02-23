import { AccountInfo, AuthenticationResult, IConfidentialClientApplication, IPublicClientApplication } from "@azure/msal-node";
import { OAuth2Config } from "../../oauth2-configuration";
import { Application, createApplication } from "./application";

type ClientApplication = IConfidentialClientApplication | IPublicClientApplication;

export interface TokenProvider {
    getToken(): Promise<string>;
}

abstract class MsalTokenProvider implements TokenProvider {
    private application: Application | undefined;

    constructor(
        protected oAuthOptions: OAuth2Config,
        protected supportedApplication: Application["type"][]) {
    }

    protected async getClient(): Promise<ClientApplication> {
        if (this.application == null) {
            const application = await createApplication(this.oAuthOptions);

            if (!this.supportedApplication.includes(application.type)) {
                throw new Error(`Unsupported application type: ${application.type}`);
            }

            this.application = application;
        }

        return this.application.client;
    }

    abstract acquireToken(client: ClientApplication): Promise<AuthenticationResult | null>;

    private async tryGetAccountFromCache(username: string | undefined): Promise<AccountInfo | undefined> {
        if (this.application?.type === "public") {
            const tokenCache = this.application.client.getTokenCache();
            const accounts = await tokenCache.getAllAccounts();

            return accounts.find(a => a.username.toLocaleLowerCase() === username?.toLocaleLowerCase());   
        }
    }

    public async getToken(): Promise<string> {
        const client = await this.getClient();

        const { scope, userName: username } = this.oAuthOptions.credentials;

        const account = await this.tryGetAccountFromCache(username);

        if (account != null) {
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
        else {
            const result = await this.acquireToken(client);

            if (result == null) {
                throw new Error("Unable to acquire token");
            }

            return result.accessToken;
        }
    }
}

class DeviceCodeTokenProvider extends MsalTokenProvider {
    constructor(oAuthOptions: OAuth2Config) {
        if (oAuthOptions.deviceCodeCallback == null) {
            throw new Error("Device code callback is required for device code flow");
        }

        if (oAuthOptions.credentials.userName == null) {
            throw new Error("Username is required for device code flow to prevent multiple device code requests");
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

class UserPasswordTokenProvider extends MsalTokenProvider {
    constructor(oAuthOptions: OAuth2Config) {
        if (oAuthOptions.credentials.userName == null || oAuthOptions.credentials.password == null) {
            throw new Error("Username and password are required for password flow");
        }

        super(oAuthOptions,  ["confidential", "public"]);
    }
    
    async acquireToken(client: IPublicClientApplication | IConfidentialClientApplication): Promise<AuthenticationResult | null> {
        const { scope, userName: username, password } = this.oAuthOptions.credentials;

        return await client.acquireTokenByUsernamePassword({
            scopes: [scope!],
            username: username!,
            password: password!
        });
    }
}

class ClientCredentialTokenProvider extends MsalTokenProvider {
    constructor(oAuthOptions: OAuth2Config) {
        if (oAuthOptions.credentials.clientId == null || oAuthOptions.credentials.clientSecret == null) {
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
    switch (oAuthOptions.credentials.grantType) {
        case "device_code":
            return new DeviceCodeTokenProvider(oAuthOptions);
        case "password":
            return new UserPasswordTokenProvider(oAuthOptions);
        case "client_credential":
            return new ClientCredentialTokenProvider(oAuthOptions);
            
        default: throw new Error("Invalid grant type");
    }
}