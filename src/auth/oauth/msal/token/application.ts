import { ConfidentialClientApplication, IConfidentialClientApplication, IPublicClientApplication, LogLevel, PublicClientApplication } from "@azure/msal-node";
import { OAuth2Config } from "../../oauth2-configuration";
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

export async function createApplication(oAuthOptions: OAuth2Config): Promise<Application> {
    const { credentials, persistence } = oAuthOptions;

    const options = {
        auth: {
            clientId: credentials.clientId,
            authority: credentials.authorityUrl,
            clientSecret: credentials.clientSecret,
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
        cache: persistence.enabled ? await getCacheOptions(persistence) : undefined
    };

    if (credentials.clientSecret) {
        return {
            type: "confidential",
            client: new ConfidentialClientApplication(options)
        };
    }
    else {
        return {
            type: "public",
            client: new PublicClientApplication(options)
        };
    }
}