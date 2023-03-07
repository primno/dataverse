import { CacheOptions } from "@azure/msal-node";
import { PersistenceOptionsOn } from "../../oauth-configuration";
import { DataProtectionScope, IPersistenceConfiguration, PersistenceCachePlugin, PersistenceCreator } from "../extensions";

export async function getCacheOptions(persistenceOptions: PersistenceOptionsOn): Promise<CacheOptions> {
    const persistenceConfiguration: IPersistenceConfiguration = {
        ...persistenceOptions,
        dataProtectionScope: DataProtectionScope.CurrentUser,
        usePlaintextFileOnLinux: false
    };

    const persistencePlugin = await PersistenceCreator.createPersistence(persistenceConfiguration);

    return {
        cachePlugin: new PersistenceCachePlugin(persistencePlugin)
    };
}