import { CacheOptions } from "@azure/msal-node";
import path from "path";
import { PersistenceOptionsOn } from "../../oauth2-configuration";
import { DataProtectionScope, IPersistenceConfiguration, PersistenceCachePlugin, PersistenceCreator } from "../extensions";

export async function getCacheOptions(persistenceOptions: PersistenceOptionsOn): Promise<CacheOptions> {
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