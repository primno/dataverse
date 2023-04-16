/**
 * Provides a token for authentication to a Dataverse instance.
 */
export interface TokenProvider {
    /**
     * Gets the URL of the Dataverse instance.
     */
    url: string;

    /**
     * Gets a token for authentication to a Dataverse instance.
     */
    getToken(): Promise<string>;
}