import { isNullOrEmpty } from "../utils/common";
import { AxiosClient, WebClient } from "@primno/dataverse-client";

export interface Authority {
    /**
     * Authority url.
     */
    authUrl: string;

    /**
     * Resource id / scope.
     */
    resource?: string;
}

/**
 * Discover authority from a Dataverse/D365 url.
 * @param url Url to discover authority from.
 * @param client Web client to use for discovery. If not specified, a new axios client will be created.
 */
export async function discoverAuthority(url: string, client?: WebClient): Promise<Authority> {
    const wwwAuthenticate = "www-authenticate";
    const bearer = "Bearer";

    if (client == null) {
        client = new AxiosClient({
            baseURL: url,
            validateStatus: () => true,
            maxRedirects: 0
        });
    }

    // SDKClientVersion ensures that the WWW-Authenticate header contains authorization_uri
    const response = await client.request({
        method: "GET",
        url: "api/discovery/?SDKClientVersion=9.1"
    });
    
    if (response.headers == null) {
        throw new Error("Unable to discover authority");
    }

    const authenticateHeader = response.headers[wwwAuthenticate]?.trim() as string | undefined;

    if (authenticateHeader?.startsWith(bearer)) {
        const result = authenticateHeader
            .substring(bearer.length)
            .split(",")
            .map(kvp => {
                const keyValues = kvp.trim().split("=");
                return {
                    key: keyValues[0],
                    value: keyValues[1]
                };
            });
        
        const authUrl = result.find(k => k.key == "authorization_uri")?.value;
        const resource = result.find(k => k.key == "resource_id")?.value;

        if (!isNullOrEmpty(authUrl)) {
            return {
                authUrl,
                resource
            };
        }
    }

     throw new Error("Unable to discover authority");
}