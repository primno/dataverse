import { AxiosInstance } from "axios";

/**
 * Provides authentication.
 */
export interface Auth {
    createClient(): AxiosInstance | Promise<AxiosInstance>;
}