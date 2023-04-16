# Dataverse Authentication for Node.JS

[![npm](https://img.shields.io/npm/v/@primno/dataverse-auth.svg)](https://www.npmjs.com/package/@primno/dataverse-auth)
[![npm](https://img.shields.io/npm/l/@primno/dataverse-auth.svg)](https://github.com/primno/dataverse/blob/main/LICENSE)
![build](https://img.shields.io/github/actions/workflow/status/primno/dataverse/test.yml)
![node-current](https://img.shields.io/node/v/@primno/dataverse-auth)

`@primno/dataverse-auth` is a library for Node.JS to authenticate to Dataverse / Dynamics 365.

`@primno/dataverse-auth` provides:
- [Authentication](#authentication) from:
  - Connection string.
  - OAuth2 flow:
    - Device code flow.
    - Client credentials flow.
    - Username/password flow.
- [Persistent token cache](#token-cache-persistence) to avoid re-authenticating.
- [Authority discovery](#discover-authority)

Works with [`@primno/dataverse-client`](https://www.npmjs.com/package/@primno/dataverse-client) to make requests to Dataverse / Dynamics 365 CE, but can be used alone, as a **standalone library**.

> This package is part of the [Primno](https://primno.io) framework.

## Compatibility

`@primno/dataverse-auth` works with Dataverse / Dynamics 365.

Dynamics 365 CE (on-premises) is supported since version 9.0 with CBA/IFD deployment (ADFS 2019+ with OAuth enabled in deployment settings).

> **Tip** If you are using Dynamics 365 App for Outlook on your on-premises environment, the prerequisite are met.

## Quick start

### Installation
```bash
  npm install @primno/dataverse-auth
```

### Usage

With connection string authentication:

```ts
import { ConnStringTokenProvider } from '@primno/dataverse-auth';

const tokenProvider = new ConnStringTokenProvider(
    "AuthType=OAuth;Url=https://<Environnement>.crm.dynamics.com;UserName=<UserName>;TokenCacheStorePath=./.cache/token.json",
    {
        oAuth: {
            // For persistent token cache on Linux/Mac to store the token in the keychain.
            // Only used when TokenCacheStorePath is set.
            persistence: {
                serviceName: "<serviceName>", // Optional, default to "Primno.DataverseClient"
                accountName: "<accountName>" // Optional, default to "MSALCache"
            },
            // For device code flow
            deviceCodeCallback: (deviceCode) => {
                console.log(deviceCode.message);
            }
        }
     }
);

const token = await tokenProvider.getToken();
```

With OAuth:

```ts
import { OAuthTokenProvider } from '@primno/dataverse-auth';

const tokenProvider = new OAuthTokenProvider({
    url: "https://<Environment>.crm.dynamics.com",
    credentials: {
        clientId: "51f81489-12ee-4a9e-aaae-a2591f45987d", // Sample client id
        redirectUri: "app://58145B91-0C36-4500-8554-080854F2AC97", // Sample redirect uri
        authorityUrl: "https://login.microsoftonline.com/common",
        scope: "https://<Environment>.crm.dynamics.com/.default",
        grantType: "device_code",
        userName: "<Username>"
    },
    persistence: {
        enabled: false
    },
    deviceCodeCallback: (deviceCode) => {
        console.log(deviceCode.message);
    }
});

const token = await tokenProvider.getToken();
```

## Authentication

dataverse-auth is provided with 2 authentication providers :
- Connection string
- OAuth2

### Connection string

`ConnStringTokenProvider` provides a token by using a connection string (see [Dataverse doc](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/xrm-tooling/use-connection-strings-xrm-tooling-connect) and [D365 CE on-premises doc](https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/developer/xrm-tooling/use-connection-strings-xrm-tooling-connect?view=op-9-1)).

Only `OAuth` authentication type is supported.

The token can be persisted using the `TokenCacheStorePath` connection string parameter. To learn more about the token cache, see [Token cache](#token-cache).

```ts
const tokenProvider = new ConnStringTokenProvider(
    "AuthType=OAuth;Url=https://<Environnement>.crm.dynamics.com;UserName=<UserName>;TokenCacheStorePath=./.cache/token.json",
    {
        oAuth: {
            // For persistent token cache on Linux/Mac to store the token in the keychain.
            // Only used when TokenCacheStorePath is set.
            persistence: {
                serviceName: "<serviceName>", // Optional, default to "Primno.DataverseClient"
                accountName: "<accountName>" // Optional, default to "MSALCache"
            },
            // For device code flow. Show the url and code to the user.
            deviceCodeCallback: (deviceCode) => {
                console.log(deviceCode.message);
            }
        }
     }
);
```

#### OAuth flows

`ConnStringTokenProvider` determines which OAuth flow to use based on the parameters in the connection string.

| Parameters | Flow |
|-----------|------|
| `UserName` and `Password` | User password |
| `ClientId` and `ClientSecret` | Client credential |
| `UserName` only | Device code |

Examples:

| Environment | AuthType | OAuth flow | Connection string |
|-------------|----------|------------|-------------------|
| Dataverse   | OAuth    | Device code | `AuthType=OAuth;Url=https://<Environnement>.crm.dynamics.com;UserName=<UserName>` |
| Dataverse   | OAuth    | User password | `AuthType=OAuth;Url=https://<Environnement>.crm.dynamics.com;UserName=<UserName>;Password=<Password>` |
| Dataverse   | OAuth    | Client credential | `AuthType=OAuth;Url=https://<Environnement>.crm.dynamics.com;ClientId=<ClientId>;ClientSecret=<ClientSecret>;RedirectUri=<RedirectUri>` |
| On-premises | OAuth    | User password | `AuthType=OAuth;RedirectUri=<RedirectUri>;Url=https://<D365Url>;UserName=<Domain>\<UserName>;Password=<Password>` |

### OAuth2

`OAuthTokenProvider` provides OAuth2 authentication.

```ts
const tokenProvider = new OAuthTokenProvider(options);
```

Options definition:

```ts
interface OAuthConfig {
    /**
     * OAuth2 credentials
     */
    credentials: {
        /**
         * OAuth flow
         */
        grantType: "client_credential" | "password" | "device_code";
        /**
         * Client ID
         */
        clientId: string;
        /**
         * Client secret for ConfidentialClientApplication.
         * If set, clientCertificate is not required.
         */
        clientSecret?: string;
        /**
         * Client certificate for ConfidentialClientApplication.
         * If set, clientSecret is not required.
         */
        clientCertificate?: {
            thumbprint: string;
            privateKey: string;
        },
        /**
         * Authority URL (eg: https://login.microsoftonline.com/common/)
         */
        authorityUrl: string;
        /**
         * Username for password and device_code flow.
         */
        userName?: string;
        /**
         * Password for password flow.
         */
        password?: string;
        /**
         * Redirect URI.
         */
        redirectUri?: string;
        /**
         * Scope. Dataverse url suffixed with .default.
         */
        scope?: string;
    };

    /**
     * Persistence options
     */
    persistence: {
        /**
         * Enable persistence. Default: false.
         */
        enabled: true;
        
        /**
         * Cache path.
         */
        cachePath: string;

        /**
         * Service name. Only used on Linux/MacOS to store the token in the keychain. Default: "Primno.DataverseClient"
         */
        serviceName: string;

        /**
         * Account name. Only used on Linux/MacOS to store the token in the keychain. Default: "MSALCache"
         */
        accountName: string;
    };

    /**
     * Device code callback. Only used when grant_type is device_code.
     * @param response The device code response
     * @returns 
     */
    deviceCodeCallback?: (response: DeviceCodeResponse) => void;

    /**
     * Dataverse / D365 url. Eg: https://org.crm.dynamics.com
     */
    url: string;
}
```

### Discover authority

To discover the authority url, you can use the `discoverAuthority` method.

```ts
interface Authority {
    authUrl: string; 
    resource?: string;
}

const authority: Authority = await discoverAuthority("<DataverseOrOnPremisesUrl>");
```

#### Token cache persistence

The token can be persisted using the `persistence` option.

It is encrypted using `DPAPI` on Windows, `libsecret` on Linux and the `Keychain` on MacOS.

## Queries
If you want to query the Dataverse API, you can use [`@primno/dataverse-client`](https://www.npmjs.com/package/@primno/dataverse-client) package.

## Troubleshooting

### Unable to verify the first certificate

On `on-premises` environments, you may have this error :

```
Error: unable to verify the first certificate
```

To fix this issue, you can add your enterprise CA certificate to the trusted root certificate authorities by setting the `NODE_EXTRA_CA_CERTS` environment variable. See [Node.js documentation](https://nodejs.org/api/cli.html#cli_node_extra_ca_certs_file) for more information.

## Credits

Thanks to Microsoft for persistence cache (msal-node-extensions).