import { CacheOptions, LogLevel, PublicClientApplication } from "@azure/msal-node";
import path from "path";
import { PersistenceOptionsEnabled } from "../../../../../d365-client-options";
import { OAuth2Config } from "../../oauth2-configuration";
import { AxiosNetworkModule } from "../axios-network-module";
import { DataProtectionScope, IPersistenceConfiguration, PersistenceCachePlugin, PersistenceCreator } from "../extensions";
import { acquireToken } from "./acquire";

async function getCacheOptions(persistenceOptions: PersistenceOptionsEnabled): Promise<CacheOptions> {
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

async function createClientApplication(oAuthOptions: OAuth2Config) {
    const { credentials, persistence } = oAuthOptions;
    return new PublicClientApplication({
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
}

export async function getToken(oAuthOptions: OAuth2Config): Promise<string | undefined> {
    const client = await createClientApplication(oAuthOptions);
    return await acquireToken(oAuthOptions, client);
}