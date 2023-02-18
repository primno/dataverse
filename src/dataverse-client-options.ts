import { DeviceCodeResponse } from "./web-client/auth/oauth/oauth2-configuration";

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

export interface OAuthOptions {
    /**
     * Configuration of persistence cache.
     */
    persistence?: PersistenceOptions;

    /**
     * Device code callback. Used when Password is not provided.
     * @returns 
     */
    deviceCodeCallback?: (response: DeviceCodeResponse) => void;
}

export type ApiVersion = "9.0" | "9.1" | "9.2";

/**
 * Configuration of Dataverse-Client.
 */
export interface DataverseClientOptions {
    oAuth?: OAuthOptions;

    /**
     * WebAPI version. Default: 9.0.
     */
    apiVersion?: ApiVersion;
}