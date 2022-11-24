import { AccountInfo, AuthenticationResult, CacheOptions, LogLevel, PublicClientApplication } from "@azure/msal-node";
import path from "path";
import { OAuth2Credentials } from "..";
import { PersistenceOptions } from "../../../../d365-client";
import { AxiosNetworkModule } from "./axios-network-module";
import { DataProtectionScope, IPersistenceConfiguration, PersistenceCachePlugin, PersistenceCreator } from "./extensions";

async function getCacheOptions(persistenceOptions: PersistenceOptions): Promise<CacheOptions> {
    // TODO: Set a correct cache path
    const cachePath = path.join(persistenceOptions.cacheDirectory!, "./msal-cache.json");

    const persistenceConfiguration: IPersistenceConfiguration = {
        ...persistenceOptions,
        cachePath,
        dataProtectionScope: DataProtectionScope.CurrentUser,
        usePlaintextFileOnLinux: false
    };

    const persistencePlugin = await PersistenceCreator.createPersistence(persistenceConfiguration);

    return {
        cachePlugin: new PersistenceCachePlugin(persistencePlugin)
    };
}

export async function getToken(credentials: OAuth2Credentials, persistence: PersistenceOptions) {
    const client = new PublicClientApplication({
        auth: {
            clientId: credentials.client_id,
            authority: credentials.url,
            clientSecret: credentials.client_secret,
            knownAuthorities: [credentials.url]
        },
        system: {
            networkClient: new AxiosNetworkModule(),
            loggerOptions: {
                loggerCallback(loglevel, message, containsPii) {
                    //console.log(message);
                },
                logLevel: LogLevel.Verbose,
                piiLoggingEnabled: false
            }
        },
        cache: persistence.enabled ? await getCacheOptions(persistence) : undefined
    });

    let result: AuthenticationResult | null;

    switch (credentials.grant_type) {
        /*case "client_credential":
            result = await client.acquireTokenByClientCredential({
                scopes: [credentials.scope as string]
            });
            break;*/
        case "password":
            try {
                const tokenCache = client.getTokenCache();
                const accounts = await tokenCache.getAllAccounts();
                
                const account = accounts.find(a => a.username.toLocaleLowerCase() === credentials.username.toLocaleLowerCase());

                result = await client.acquireTokenSilent({ scopes: [credentials.scope as string], account: account as AccountInfo });
            }
            catch(except) {
                result = await client.acquireTokenByUsernamePassword({
                    scopes: [credentials.scope as string],
                    username: credentials.username,
                    password: credentials.password
                });
            }
            break;
        default: throw new Error("Invalid grant type");
    }

    return result?.accessToken;
}