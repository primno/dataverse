import { ConnectionStringProcessor, LoginPromptType } from "../../connection-string";
import { Authority } from "./authority";
import { OAuth2Credentials } from "./oauth-configuration";

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

    if (connectionString.loginPrompt == null ||
        connectionString.loginPrompt === LoginPromptType.Always ||
        connectionString.loginPrompt === LoginPromptType.Auto) {
        return "device_code";
    }

    throw new Error("Unable to choose a grant type");
}

export function convertToOAuth2Credential(
    connectionString: ConnectionStringProcessor,
    authority: Authority
): OAuth2Credentials {
    return {
        clientId: connectionString.clientId as string,
        grantType: getGrantType(connectionString),
        userName: connectionString.userName,
        password: connectionString.password,
        redirectUri: connectionString.redirectUri,
        clientSecret: connectionString.clientSecret,
        scope: `${authority.resource}/.default`,
        authorityUrl: authority.authority.replace("oauth2/authorize", "").replace("common", "organizations")
    };
}