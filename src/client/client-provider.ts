export type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS" | "TRACE" | string;

export interface RequestOptions {
    method: Method;
    url: string;
    data?: any;
    headers?: Record<string, string>
}

export interface Response {
    data: any;
    headers?: Record<string, string>;
}

export interface WebClient {
    request(config: RequestOptions): Promise<Response>;
}

/**
 * Provides web client.
 * Can be used to create web client with authentication.
 */
export interface ClientProvider {
    createClient(): WebClient | Promise<WebClient>;
}