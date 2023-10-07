import { CacheOptions } from "@azure/msal-node";
import { PersistenceOptionsOn } from "../../oauth-configuration";
import { DataProtectionScope, IPersistenceConfiguration, PersistenceCachePlugin, PersistenceCreator } from "@azure/msal-node-extensions";

export async function getCacheOptions(persistenceOptions: PersistenceOptionsOn): Promise<CacheOptions> {
    const persistenceConfiguration: IPersistenceConfiguration = {
        // Default values
        serviceName: "Primno.DataverseClient",
        accountName: "MSALCache",
        dataProtectionScope: DataProtectionScope.CurrentUser,
        usePlaintextFileOnLinux: false,
        // Override with user values
        ...persistenceOptions
    };

    const persistencePlugin = await PersistenceCreator.createPersistence(persistenceConfiguration);

    return {
        cachePlugin: new PersistenceCachePlugin(persistencePlugin)
    };
}