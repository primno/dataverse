import { Authority } from "../../oauth/authority";
import { OAuthCredentials } from "../../oauth/oauth-configuration";
import { ConnectionString, LoginPromptType } from "../connection-string";

function getGrantType(connectionString: ConnectionString) {
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

    if (connectionString.loginPrompt == null ||
        connectionString.loginPrompt === LoginPromptType.Always ||
        connectionString.loginPrompt === LoginPromptType.Auto) {
        return "device_code";
    }

    throw new Error("Unable to choose a grant type");
}

export function convertToOAuth2Credential(
    connectionString: ConnectionString,
    authority: Authority
): OAuthCredentials {
    if (connectionString.clientId == null) {
        throw new Error("Connection string is missing client id");
    }

    return {
        clientId: connectionString.clientId as string,
        grantType: getGrantType(connectionString),
        userName: connectionString.userName,
        password: connectionString.password,
        redirectUri: connectionString.redirectUri,
        clientSecret: connectionString.clientSecret,
        scope: `${authority.resource}/.default`,
        authorityUrl: authority.authUrl.replace("oauth2/authorize", "").replace("common", "organizations")
    };
}