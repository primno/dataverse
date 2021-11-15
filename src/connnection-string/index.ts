import { parseConnectionString } from "@tediousjs/connection-string";
import { isNullOrEmpty, takeFirstNotNullOrEmpty } from "../common";
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

export enum AuthenticationType {
    AD,
    OAuth,
    Certificate,
    ClientSecret
}

const sampleClientId = "51f81489-12ee-4a9e-aaae-a2591f45987d";
const sampleRedirectUrl = "app://58145B91-0C36-4500-8554-080854F2AC97";

export class ConnectionStringProcessor {

    private _serviceUri?: string;

    public get serviceUri(): string | undefined {
        return this._serviceUri;
    }

    private _userName?: string;

    public get userName(): string | undefined {
        return this._userName;
    }

    private _password?: string;

    public get password(): string | undefined {
        return this._password;
    }

    private _domain?: string;

    public get domain(): string | undefined {
        return this._domain;
    }

    private _homeRealmUri?: string;

    public get homeRealmUri(): string | undefined {
        return this._homeRealmUri;
    }

    private _authType?: AuthenticationType;

    public get authType(): AuthenticationType | undefined {
        return this._authType;
    }

    private _requireNewInstance?: string;

    public get requireNewInstance(): string | undefined {
        return this._requireNewInstance;
    }

    private _clientId?: string;

    public get clientId(): string | undefined {
        return this._clientId;
    }

    private _redirectUri?: string;

    public get redirectUri(): string | undefined {
        return this._redirectUri;
    }

    private _tokenCacheStorePath?: string;

    public get tokenCacheStorePath(): string | undefined {
        return this._tokenCacheStorePath;
    }

    private _loginPrompt?: string;

    public get loginPrompt(): string | undefined {
        return this._loginPrompt;
    }

    private _certStoreName?: string;

    public get certStoreName(): string | undefined {
        return this._certStoreName;
    }

    private _certThumbprint?: string;

    public get certThumbprint(): string | undefined {
        return this._certThumbprint;
    }

    private _skipDiscovery?: string;

    public get skipDiscovery(): string | undefined {
        return this._skipDiscovery;
    }

    private _integratedSecurity?: string;

    public get integratedSecurity(): string | undefined {
        return this._integratedSecurity;
    }

    private _clientSecret?: string;

    public get clientSecret(): string | undefined {
        return this._clientSecret;
    }

    private _isOnline?: boolean;

    public get isOnline(): boolean | undefined {
        return this._isOnline;
    }

    public constructor(connectionString: string) {
        const parsed = parseConnectionString(connectionString) as Record<string, string>;

        this._serviceUri = takeFirstNotNullOrEmpty(parsed, ServiceUri);
        this._userName = takeFirstNotNullOrEmpty(parsed, UserName);
        this._password = takeFirstNotNullOrEmpty(parsed, Password);
        this._clientId = takeFirstNotNullOrEmpty(parsed, ClientId);
        this._clientSecret = takeFirstNotNullOrEmpty(parsed, ClientSecret);
        this._redirectUri = takeFirstNotNullOrEmpty(parsed, RedirectUri);
        this._domain = takeFirstNotNullOrEmpty(parsed, Domain);
        this._authType = this.parseAuthenticationType(takeFirstNotNullOrEmpty(parsed, AuthType));

        if (this._authType == AuthenticationType.OAuth && isNullOrEmpty(this._clientId) && isNullOrEmpty(this._redirectUri)) {
            this._clientId = sampleClientId;
            this._redirectUri = sampleRedirectUrl;
        }

        this._isOnline = this.isOnlineUri(this.serviceUri as string);
    }

    private isOnlineUri(uri: string): boolean {
        const parsedUri = uriParse(uri);
        const host = parsedUri.host?.toUpperCase();

        const onlineDomains = ["DYNAMICS.COM", "MICROSOFTDYNAMICS.DE",
                               "MICROSOFTDYNAMICS.US", "APPSPLATFORM.US",
                               "CRM.DYNAMICS.CN", "DYNAMICS-INT.COM"];

        return onlineDomains.some(d => host?.endsWith(d));
    }

    private parseAuthenticationType(authType?: string): AuthenticationType | undefined {
        switch (authType?.toLowerCase()) {
            case "oauth": return AuthenticationType.OAuth;
            case "certificate": return AuthenticationType.Certificate;
            case "clientsecret": return AuthenticationType.ClientSecret;
            case "ad": return AuthenticationType.AD;
        }
    }
}