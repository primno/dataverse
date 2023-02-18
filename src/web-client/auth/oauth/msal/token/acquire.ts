import { AccountInfo, AuthenticationResult, IPublicClientApplication } from "@azure/msal-node";
import { OAuth2Config } from "../../oauth2-configuration";

export async function acquireToken(oAuthOptions: OAuth2Config, client: IPublicClientApplication) {
    let result: AuthenticationResult | null = null;

    switch (oAuthOptions.credentials.grant_type) {
        case "device_code":
            result = await acquireDeviceCode(client, oAuthOptions);
            break;
        case "password":
            result = await acquireUserPassword(client, oAuthOptions);
            break;
        default: throw new Error("Invalid grant type");
    }

    return result?.accessToken;
}

async function acquireUserPassword(client: IPublicClientApplication, oAuthOptions: OAuth2Config) {
    const { scope, username, password } = oAuthOptions.credentials;

    if (username == null) {
        throw new Error("Username is required");
    }

    if (password == null) {
        throw new Error("Password is required");
    }

    try {
        const tokenCache = client.getTokenCache();
        const accounts = await tokenCache.getAllAccounts();

        const account = accounts.find(a => a.username.toLocaleLowerCase() === username.toLocaleLowerCase());

        return await client.acquireTokenSilent(
            {
                scopes: [scope as string],
                account: account as AccountInfo
            }
        );
    }
    catch (except) {
        return await client.acquireTokenByUsernamePassword({
            scopes: [scope as string],
            username,
            password
        });
    }
}

async function acquireDeviceCode(client: IPublicClientApplication, oAuthOptions: OAuth2Config) {
    const { scope, username } = oAuthOptions.credentials;
    const { deviceCodeCallback } = oAuthOptions;

    if (deviceCodeCallback == null) {
        throw new Error("Device code callback is required");
    }

    if (username == null) {
        throw new Error("Username is required in device code flow. Password is not required.");
    }

    try {
        const tokenCache = client.getTokenCache();
        const accounts = await tokenCache.getAllAccounts();

        const account = accounts.find(a => a.username.toLocaleLowerCase() === username.toLocaleLowerCase());

        return await client.acquireTokenSilent(
            {
                scopes: [scope as string],
                account: account as AccountInfo
            }
        );
    }
    catch (except) {
        return await client.acquireTokenByDeviceCode({
            scopes: [scope as string],
            deviceCodeCallback
        });
    }
}
