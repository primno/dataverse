import { ConnectionStringProcessor } from "../../../connection-string";
import { PersistenceOptions } from "../../../dataverse-client-options";
import { DiscoveredAuthority } from "./authority";

export interface OAuth2Credentials {
    grant_type: "client_credential" | "password" | "device_code";
    client_id: string;
    client_secret?: string;
    url: string;
    username?: string;
    password?: string;
    redirect_uri?: string;
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

export interface OAuth2Config {
    /**
     * The OAuth2 credentials
     */
    credentials: OAuth2Credentials;

    /**
     * The persistence options
     */
    persistence: PersistenceOptions;

    /**
     * Device code callback. Only used when grant_type is device_code.
     * @param response The device code response
     * @returns 
     */
    deviceCodeCallback?: (response: DeviceCodeResponse) => void;
}

function getGrantType(connectionString: ConnectionStringProcessor) {
    if (connectionString.certStoreName != null || connectionString.certThumbprint != null) {
        throw new Error("Certificate authentication is not supported");
    }

    if (connectionString.userName != null &&
        connectionString.password != null) {
        return "password";
    }

    if (connectionString.clientSecret != null) {
        return "client_credential";
    }
    
    return "device_code";
}

export function convertToOAuth2Credential(
    connectionString: ConnectionStringProcessor,
    authority: DiscoveredAuthority
): OAuth2Credentials {
    return {
        client_id: connectionString.clientId as string,
        grant_type: getGrantType(connectionString),
        username: connectionString.userName,
        password: connectionString.password,
        redirect_uri: connectionString.redirectUri,
        client_secret: connectionString.clientSecret,
        scope: `${authority.resource}/.default`,
        url: authority.authority.replace("oauth2/authorize", "").replace("common", "organizations")
    };
}
