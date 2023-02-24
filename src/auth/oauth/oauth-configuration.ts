export interface OAuth2Credentials {
    grantType: "client_credential" | "password" | "device_code";
    clientId: string;
    clientSecret?: string;
    authorityUrl: string;
    userName?: string;
    password?: string;
    redirectUri?: string;
    scope?: string;
}

export interface DeviceCodeResponse {
    userCode: string;
    deviceCode: string;
    verificationUri: string;
    expiresIn: number;
    interval: number;
    message: string;
}

export interface PersistenceOptionsOn {
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

interface PersistenceOptionsOff {
    /**
     * Enable persistence. Default: false.
     */
    enabled?: false;
}

export type PersistenceOptions = PersistenceOptionsOn | PersistenceOptionsOff;

export interface OAuthConfig {
    /**
     * OAuth2 credentials
     */
    credentials: OAuth2Credentials;

    /**
     * Persistence options
     */
    persistence: PersistenceOptions;

    /**
     * Device code callback. Only used when grant_type is device_code.
     * @param response The device code response
     * @returns 
     */
    deviceCodeCallback?: (response: DeviceCodeResponse) => void;

    /**
     * Dataverse / D365 url. Eg: https://org.crm.dynamics.com
     */
    url: string;
}
