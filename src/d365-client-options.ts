export interface PersistenceOptionsEnabled {
    /**
     * Enable persistence. Default: false.
     */
    enabled: true;
    /**
     * Cache directory.
     */
    cacheDirectory: string;
    /**
     * Service name.
     */
    serviceName: string;
    /**
     * Account name.
     */
    accountName: string;
}

interface PersistenceOptionsDisabled {
    /**
     * Enable persistence. Default: false.
     */
    enabled?: false;
}

export type PersistenceOptions = PersistenceOptionsEnabled | PersistenceOptionsDisabled;

export type ApiVersion = "9.0" | "9.1" | "9.2";

/**
 * Configuration of D365-Client.
 */
export interface D365ClientOptions {
    /**
     * Configuration of persistence cache.
     */
    persistence?: PersistenceOptions;

    /**
     * WebAPI version. Default: 9.0.
     */
    apiVersion?: ApiVersion;
}