import { parseConnectionString } from "@tediousjs/connection-string";
import { isNullOrEmpty, takeFirstNotNullOrEmpty } from "../../../utils/common";
import { parse as uriParse }  from "uri-js";

const ServiceUri = ["ServiceUri", "Service Uri", "Url", "Server"];
const UserName = [ "UserName", "User Name", "UserId", "User Id" ];
const Password = ["Password"];
const Domain = ["Domain"];
const HomeRealmUri = ["HomeRealmUri", "Home Realm Uri"];
const AuthType = ["AuthType", "AuthenticationType"];
const RequireNewInstance = ["RequireNewInstance"];
const ClientId = ["ClientId", "AppId", "ApplicationId"];
const RedirectUri = ["RedirectUri", "ReplyUrl"];
const TokenCacheStorePath = ["TokenCacheStorePath"];
const LoginPrompt = ["LoginPrompt"];
const CertThumbprint = ["CertificateThumbprint", "Thumbprint"];
const CertStoreName = ["CertificateStoreName", "StoreName"];
const SkipDiscovery = ["SkipDiscovery"];
const IntegratedSecurity = ["Integrated Security"];
const ClientSecret = ["ClientSecret" , "Secret"];

/**
 * Authentication type.
 */
export enum AuthenticationType {
    /**
     * Active Directory authentication.
     */
    AD,
    /**
     * OAuth authentication.
     */
    OAuth,
    /**
     * Unsupported.
     */
    Office365,
    /**
     * Unsupported.
     */
    Certificate,
    /**
     * Unsupported.
     */
    ClientSecret
}

export enum LoginPromptType {
    Auto,
    Always,
    Never
}

const sampleClientId = "51f81489-12ee-4a9e-aaae-a2591f45987d";
const sampleRedirectUrl = "app://58145B91-0C36-4500-8554-080854F2AC97";

export class ConnectionString {
    /**
     * Url to the Dataverse / D365 environment.
     */
    public serviceUri?: string;

    /**
     * User identification name.
     */
    public userName?: string;

    /**
     * Password for the user name.
     */
    public password?: string;

    /**
     * Domain for the user. Used for AD authentication.
     */
    public domain?: string;

    public homeRealmUri?: string;

    /**
     * Authentication type.
     * AD and OAuth are supported.
     */
    public authType?: AuthenticationType;

    public requireNewInstance?: boolean;

    /**
     * Client id for OAuth authentication.
     */
    public clientId?: string;

    /**
     * Redirect url for OAuth authentication.
     */
    public redirectUri?: string;

    /**
     * Path to the token cache file.
     * Used for OAuth authentication only.
     */
    public tokenCacheStorePath?: string;

    public loginPrompt?: LoginPromptType;
    public certThumbprint?: string;
    public certStoreName?: string;
    public skipDiscovery?: boolean;
    public integratedSecurity?: string;

    /**
     * Client secret for OAuth authentication.
     */
    public clientSecret?: string;

    /**
     * Indicates if the connection string is for online environment.
     */
    public get isOnline(): boolean | undefined {
        if (isNullOrEmpty(this.serviceUri)) {
            return undefined;
        }

        const parsedUri = uriParse(this.serviceUri);
        const host = parsedUri.host?.toUpperCase();

        const onlineDomains = ["DYNAMICS.COM", "MICROSOFTDYNAMICS.DE",
                               "MICROSOFTDYNAMICS.US", "APPSPLATFORM.US",
                               "CRM.DYNAMICS.CN", "DYNAMICS-INT.COM"];

        return onlineDomains.some(d => host?.endsWith(d));
    }

    public constructor(connectionString: string) {
        const parsed = parseConnectionString(connectionString) as Record<string, string>;

        this.authType = this.parseAuthenticationType(takeFirstNotNullOrEmpty(parsed, AuthType));
        this.serviceUri = takeFirstNotNullOrEmpty(parsed, ServiceUri);
        this.userName = takeFirstNotNullOrEmpty(parsed, UserName);
        this.password = takeFirstNotNullOrEmpty(parsed, Password);
        this.clientId = takeFirstNotNullOrEmpty(parsed, ClientId);
        this.clientSecret = takeFirstNotNullOrEmpty(parsed, ClientSecret);
        this.redirectUri = takeFirstNotNullOrEmpty(parsed, RedirectUri);
        this.domain = takeFirstNotNullOrEmpty(parsed, Domain);
        this.tokenCacheStorePath = takeFirstNotNullOrEmpty(parsed, TokenCacheStorePath);
        this.certStoreName = takeFirstNotNullOrEmpty(parsed, CertStoreName);
        this.certThumbprint = takeFirstNotNullOrEmpty(parsed, CertThumbprint);
        this.homeRealmUri = takeFirstNotNullOrEmpty(parsed, HomeRealmUri);
        this.requireNewInstance = this.parseBoolean(takeFirstNotNullOrEmpty(parsed, RequireNewInstance));
        this.loginPrompt = this.parseLoginPrompt(takeFirstNotNullOrEmpty(parsed, LoginPrompt));
        this.skipDiscovery = this.parseBoolean(takeFirstNotNullOrEmpty(parsed, SkipDiscovery));
        this.integratedSecurity = takeFirstNotNullOrEmpty(parsed, IntegratedSecurity);

        if (this.authType == AuthenticationType.OAuth && isNullOrEmpty(this.clientId) && isNullOrEmpty(this.redirectUri)) {
            this.clientId = sampleClientId;
            this.redirectUri = sampleRedirectUrl;
        }
    }

    private parseBoolean(value?: string): boolean | undefined {
        if (value == null) {
            return undefined;
        }

        return value.toLowerCase() === "true";
    }

    private parseLoginPrompt(loginPrompt?: string): LoginPromptType | undefined {
        switch (loginPrompt?.toLowerCase()) {
            case "auto": return LoginPromptType.Auto;
            case "always": return LoginPromptType.Always;
            case "never": return LoginPromptType.Never;
        }
    }

    private parseAuthenticationType(authType?: string): AuthenticationType | undefined {
        switch (authType?.toLowerCase()) {
            case "oauth": return AuthenticationType.OAuth;
            case "certificate": return AuthenticationType.Certificate;
            case "clientsecret": return AuthenticationType.ClientSecret;
            case "office365": return AuthenticationType.Office365;
            case "ad": return AuthenticationType.AD;
        }
    }
}