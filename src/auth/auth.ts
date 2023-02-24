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
 * Provides authentication.
 */
export interface Auth {
    createClient(): WebClient | Promise<WebClient>;
}