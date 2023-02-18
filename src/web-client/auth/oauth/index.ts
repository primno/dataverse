import { AxiosInstance, AxiosRequestConfig } from "axios";
import { ConnectionStringProcessor } from "../../../connection-string";
import { discoverAuthority } from "./authority";
import { OAuthOptions } from "../../../dataverse-client-options";
import { convertToOAuth2Credential, OAuth2Config } from "./oauth2-configuration";
import { createAdfsOAuthClient } from "./adfs";
import { createMsalClient } from "./msal";

/**
 * Create a axios client that uses OAuth2 to get an access token.
 * Uses MSAL for online and ADFS for on-premises
 */
export async function createOAuthClient(
    connectionString: ConnectionStringProcessor,
    axiosConfig: AxiosRequestConfig,
    options: OAuthOptions
): Promise<AxiosInstance> {
    const authority = await discoverAuthority(axiosConfig);
    const credentials = convertToOAuth2Credential(connectionString, authority, connectionString.isOnline == true);

    const oAuthOptions: OAuth2Config = {
        credentials,
        persistence: options.persistence!,
        deviceCodeCallback: options.deviceCodeCallback
    };

    if (connectionString.isOnline) {
        return createMsalClient(oAuthOptions, axiosConfig);
    }
    else {
        return createAdfsOAuthClient(oAuthOptions, axiosConfig);
    }
}
