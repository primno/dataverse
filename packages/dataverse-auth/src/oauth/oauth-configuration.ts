/**
 * OAuth2 credentials.
 */
export interface OAuthCredentials {
    /**
     * OAuth flow
     */
    grantType: "client_credential" | "password" | "device_code";
    /**
     * Client ID
     */
    clientId: string;
    /**
     * Client secret for ConfidentialClientApplication.
     * If set, clientCertificate is not required.
     */
    clientSecret?: string;
    /**
     * Client certificate for ConfidentialClientApplication.
     * If set, clientSecret is not required.
     */
    clientCertificate?: {
        thumbprint: string;
        privateKey: string;
    },
    /**
     * Authority URL (eg: https://login.microsoftonline.com/common/)
     */
    authorityUrl: string;
    /**
     * Username for password and device_code flow.
     */
    userName?: string;
    /**
     * Password for password flow.
     */
    password?: string;
    /**
     * Redirect URI.
     */
    redirectUri?: string;
    /**
     * Scope. Dataverse url suffixed with .default.
     */
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
     * Cache path.
     */
    cachePath: string;

    /**
     * Service name. Only used on Linux/MacOS to store the token in the keychain.
     * @default "Primno.DataverseClient"
     */
    serviceName?: string;

    /**
     * Account name. Only used on Linux/MacOS to store the token in the keychain.
     * @default "MSALCache"
     */
    accountName?: string;
}

interface PersistenceOptionsOff {
    /**
     * Enable persistence. Default: false.
     */
    enabled?: false;
}

export type PersistenceOptions = PersistenceOptionsOn | PersistenceOptionsOff;

/**
 * Options for OAuth2 authentication
 */
export interface OAuthConfig {
    /**
     * OAuth2 credentials
     */
    credentials: OAuthCredentials;

    /**
     * Persistence options.
     * @default { enabled: false }
     */
    persistence?: PersistenceOptions;

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
