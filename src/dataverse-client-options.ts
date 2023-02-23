export type ApiVersion = "9.0" | "9.1" | "9.2";

/**
 * Configuration of Dataverse-Client.
 */
export interface DataverseClientOptions {
    /**
     * WebAPI version. Default: 9.0.
     */
    apiVersion?: ApiVersion;
}