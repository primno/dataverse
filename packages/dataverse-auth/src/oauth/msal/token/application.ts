import { ConfidentialClientApplication, IConfidentialClientApplication, IPublicClientApplication, LogLevel, PublicClientApplication } from "@azure/msal-node";
import { OAuthConfig } from "../../oauth-configuration";
import { AxiosNetworkModule } from "../axios-network-module";
import { getCacheOptions } from "./cache";

interface PublicApplication {
    type: "public";
    client: IPublicClientApplication;
}

interface ConfidentialApplication {
    type: "confidential";
    client: IConfidentialClientApplication;
}

export type Application = PublicApplication | ConfidentialApplication;

export async function createApplication(oAuthOptions: OAuthConfig): Promise<Application> {
    const { credentials, persistence } = oAuthOptions;

    const options = {
        auth: {
            clientId: credentials.clientId,
            authority: credentials.authorityUrl,
            knownAuthorities: [credentials.authorityUrl]
        },
        system: {
            networkClient: new AxiosNetworkModule(),
            loggerOptions: {
                loggerCallback() {
                    //console.log(message);
                },
                logLevel: LogLevel.Verbose,
                piiLoggingEnabled: false
            }
        },
        cache: persistence?.enabled ? await getCacheOptions(persistence) : undefined
    };

    if (credentials.clientSecret || credentials.clientCertificate) {
        return {
            type: "confidential",
            client: new ConfidentialClientApplication({
                ...options,
                auth: {
                    ...options.auth,
                    clientSecret: credentials.clientSecret,
                    clientCertificate: credentials.clientCertificate
                }
            })
        };
    }
    else {
        return {
            type: "public",
            client: new PublicClientApplication(options)
        };
    }
}