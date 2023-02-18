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
    // if (connectionString.clientSecret) {
    //     return "client_credential";
    // }
    if (connectionString.userName && connectionString.password) {
        return "password";
    }
    else {
        return "device_code";
    }
}

export function convertToOAuth2Credential(
    connectionString: ConnectionStringProcessor,
    authority: DiscoveredAuthority,
    msal: boolean
): OAuth2Credentials {
    return {
        client_id: connectionString.clientId as string,
        // TODO: Support client_credentials
        grant_type: getGrantType(connectionString),
        username: connectionString.userName as string,
        password: connectionString.password as string,
        redirect_uri: connectionString.redirectUri,
        client_secret: connectionString.clientSecret,
        scope: `${authority.resource}${msal ? '/.default' : ''}`,
        url: msal ?
            authority.authority.replace("oauth2/authorize", "").replace("common", "organizations") :
            authority.authority.replace("oauth2/authorize", "oauth2/token")
    };
}
