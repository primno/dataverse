import { AuthenticationResult, ConfidentialClientApplication, LogLevel, PublicClientApplication } from "@azure/msal-node";
import { OAuth2Credentials } from "..";
import { AxiosNetworkModule } from "./axios-network-module";

export async function getToken(credentials: OAuth2Credentials) {
    const client = new PublicClientApplication({
        auth: {
            clientId: credentials.client_id,
            authority: credentials.url,
            clientSecret: credentials.client_secret,
            knownAuthorities: [credentials.url]
        },
        system: {
            networkClient: new AxiosNetworkModule(),
            loggerOptions: {
                loggerCallback(loglevel, message, containsPii) {
                    //console.log(message);
                },
                logLevel: LogLevel.Verbose,
                piiLoggingEnabled: false
            }
        }
    });

    let result: AuthenticationResult | null;

    switch (credentials.grant_type) {
        /*case "client_credential":
            result = await client.acquireTokenByClientCredential({
                scopes: [credentials.scope as string]
            });
            break;*/
        case "password":
            result = await client.acquireTokenByUsernamePassword({
                scopes: [credentials.scope as string],
                username: credentials.username,
                password: credentials.password
            });
            break;
        default: throw new Error("Invalid grant type");
    }

    return result?.accessToken;
}