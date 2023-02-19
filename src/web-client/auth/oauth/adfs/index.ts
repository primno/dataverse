import https from "https";
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { OAuth2Config } from "../oauth2-configuration";
import oauth from "axios-oauth-client";
const tokenProvider = require('axios-token-interceptor');

/**
 * Create a axios client that uses ADFS to get an access token
 */
export function createAdfsOAuthClient(oAuthOptions: OAuth2Config, axiosConfig: AxiosRequestConfig): AxiosInstance {
    const { credentials } = oAuthOptions;

    const oauthClient = axios.create({
        httpsAgent: new https.Agent({ keepAlive: true })
    });

    const client = axios.create(axiosConfig);
    const getOwnerCredentials = oauth.client(oauthClient, credentials);

    client.interceptors.request.use(
        oauth.interceptor(tokenProvider, getOwnerCredentials)
    );

    return client;
}