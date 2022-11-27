import axios, { AxiosRequestConfig } from "axios";
import { isNullOrEmpty } from "../../../utils/common";
import { ConnectionStringProcessor } from "../../../connnection-string";

export interface DiscoveredAuthority {
    authority: string; 
    resource?: string;
}

export async function discoverAuthority(connectionString: ConnectionStringProcessor, axiosConfig: AxiosRequestConfig): Promise<DiscoveredAuthority> {
    const wwwAuthenticate = "www-authenticate";
    const bearer = "Bearer";

    const client = axios.create(axiosConfig);
    // SDKClientVersion ensures that the WWW-Authenticate header contains authorization_uri
    const response = await client.get("api/discovery/?SDKClientVersion=9.1", {
        validateStatus: () => true,
        maxRedirects: 0
    });

    const authenticateHeader = response.headers[wwwAuthenticate]?.trim();

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
        
        const authUri = result.find(k => k.key == "authorization_uri")?.value;
        const resource = result.find(k => k.key == "resource_id")?.value;

        if (!isNullOrEmpty(authUri)) {
            return {
                authority: authUri,
                resource: resource
            };
        }
    }

     throw new Error("Unable to discover authority");
}