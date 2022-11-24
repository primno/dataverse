import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { ConnectionStringProcessor } from "../../../connnection-string";
import { HttpsAgentWithRootCA } from "../../https-agent";
import { discoverAuthority, DiscoveredAuthority } from "./authority";
import { getToken } from "./msal/token";
import oauth from "axios-oauth-client";
import { PersistenceOptions } from "../../../d365-client";

const tokenProvider = require('axios-token-interceptor');

export interface OAuth2Credentials {
    grant_type: "client_credential" | "password";
    client_id: string;
    client_secret?: string;
    url: string;
    username: string;
    password: string;
    redirect_uri?: string;
    scope?: string;
}

export async function createOAuthClient(connectionStringProcessor: ConnectionStringProcessor, axiosConfig: AxiosRequestConfig, persistence: PersistenceOptions) {
    let authority = await discoverAuthority(connectionStringProcessor, axiosConfig);
    const credentials = convertToOAuth2Credential(connectionStringProcessor, authority, connectionStringProcessor.isOnline == true);

    if (connectionStringProcessor.isOnline) {
        return createMsalClient(credentials, axiosConfig, persistence);
    }
    else {
        return createAdfsOAuthClient(credentials, axiosConfig);
    }
}

function createMsalClient(credentials: OAuth2Credentials, axiosConfig: AxiosRequestConfig, persistence: PersistenceOptions): AxiosInstance {
    const client = axios.create(axiosConfig);
    client.interceptors.request.use(async (config) => {
        const accessToken = await getToken(credentials, persistence);
        if (accessToken) {
            if (config.headers) {
                config.headers["Authorization"] = `Bearer ${accessToken}`;
            }
        }

        return config;
    });

    return client;
}

function createAdfsOAuthClient(credentials: OAuth2Credentials, axiosConfig: AxiosRequestConfig): AxiosInstance {
    const oauthClient = axios.create({
        httpsAgent: new HttpsAgentWithRootCA({ keepAlive: true })
    });

    const client = axios.create(axiosConfig);
    const getOwnerCredentials = oauth.client(oauthClient, credentials);

    client.interceptors.request.use(
        oauth.interceptor(tokenProvider, getOwnerCredentials)
    );

    return client;
}

function convertToOAuth2Credential(connectionString: ConnectionStringProcessor, authority: DiscoveredAuthority, msal: boolean): OAuth2Credentials {
    return {
        client_id: connectionString.clientId as string,
        // TODO: Support client_credential
        grant_type: "password",
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
