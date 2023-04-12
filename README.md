# Dataverse Client for Node.JS

[![npm](https://img.shields.io/npm/v/@primno/dataverse-client.svg)](https://www.npmjs.com/package/@primno/dataverse-client)
[![npm](https://img.shields.io/npm/l/@primno/dataverse-client.svg)](https://github.com/primno/dataverse-client/blob/main/LICENSE)
![build](https://img.shields.io/github/actions/workflow/status/primno/dataverse-client/build.yml)

dataverse-client is library for Node.JS to make WebAPI requests to Dataverse and Dynamics 365 CE (on-premises).

dataverse-client provides :
- [Authentication](#authentication) to Dataverse:
    - Connection string
    - OAuth
    - Your custom token provider.
- [Query builder](#queries) to build OData queries.

> This package is part of the [Primno](https://primno.io) framework.

## Compatibility

dataverse-client works with Dataverse (Dynamics 365 Online) and Dynamics 365 CE (on-premises).

Dynamics 365 CE (on-premises) is supported since version 9.0 with CBA/IFD deployment (ADFS 2019+ with OAuth enabled in deployment settings).

## Quick start

### Installation
```bash
  npm install @primno/dataverse-client
```

### Usage

With connection string authentication:

```ts
import { DataverseClient, ConnStringTokenProvider } from '@primno/dataverse-client';

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
const client = new DataverseClient(tokenProvider);

const accounts = await client.retrieveMultipleRecords("accounts", { top: 10 });
console.log(accounts);
```

With OAuth:

```ts
import { DataverseClient, OAuthTokenProvider } from '@primno/dataverse-client';

const tokenProvider = new OAuthTokenProvider({
    url: "https://<Environment>.crm.dynamics.com",
    credentials: {
        clientId: "51f81489-12ee-4a9e-aaae-a2591f45987d", // Sandbox client id
        redirectUri: "app://58145B91-0C36-4500-8554-080854F2AC97", // Sandbox redirect uri
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

const client = new DataverseClient(tokenProvider);

const accounts = await client.retrieveMultipleRecords("accounts", { top: 10 });
console.log(accounts);
```

## Authentication

dataverse-client is provided with 2 authentication providers :
- Connection string
- OAuth

You can also implement your own authentication provider by implementing the `TokenProvider` interface.

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

### OAuth

`OAuthTokenProvider` provides OAuth authentication.

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

#### Token cache

The token can be persisted using the `persistence` option.

It is encrypted using `DPAPI` on Windows, `libsecret` on Linux and the `Keychain` on MacOS.

## Queries

The following methods are available to query Dataverse:
- `retrieveMultipleRecords`: Retrieves a set of records.
- `retrieveRecord`: Retrieves a single record by its id.
- `createRecord`: Creates a record.
- `updateRecord`: Updates a record by its id.
- `deleteRecord`: Deletes a record by its id.
- `executeAction`: Executes an action, function, or workflow.

Retrieve can be done by providing a `RetrieveMultipleOptions` object or a raw query string.

***Note:***
The name of the entity must be the entity set name (plural).

### Examples

1. Retrieves first 10 accounts.

    ```ts
    interface Account {
        name: string;
        emailaddress1: string;
    }

    const accounts = await client.retrieveMultipleRecords<Account>(
        "accounts",
        {
            top: 10,
            select: ["name", "emailaddress1"],
            orders: [{ attribute: "name", order: "asc" }]
        }
    );
    ```

1. Create a contact.

    ```ts
    const contact = await client.createRecord("contacts", {
        firstname: "Sophie", lastname: "Germain"
    });
    ```

1. Delete a account.

    ```ts
    await client.deleteRecord("accounts", "00000000-0000-0000-0000-000000000000");
    ```

1. Retrieves a contact by its id.
    ```ts
    const contact = await client.retrieveRecord("contacts", "00000000-0000-0000-0000-000000000000", { select: ["firstname"] });
    ```

1. Retrieves actives opportunities using a custom query option string.

    ```ts
    const opportunities = await d365Client.retrieveMultipleRecords("opportunities", "?$select=name,$filter=state eq 0");
    ```

1. Retrieves all contacts using OData pagination.
    The page size is set to 50. The nextLink attribute is used to get the next page.

    ```ts
    const contacts = []; // Will contain all contacts.

    let options: RetrieveMultipleOptions | undefined = {
        select: ["firstname", "lastname"]
    };

    let result: EntityCollection;

    do {
        result = await client.retrieveMultipleRecords("contacts", options, 50 /* Page Size = 50 */);
        contacts.push(...result.entities);
        options = result.nextLink;
    } while(result.nextLink);

    console.log(contacts);
    ```

1. Retrieves contacts created this month.

    ```ts
    const contacts = await client.retrieveMultipleRecords("accounts", {
        select: ["name"],
        filters: [{ conditions: [{ attribute: "createdon", operator: "ThisMonth" }] }]
    });
    ```

## Troubleshooting

### Unable to verify the first certificate

On `on-premises` environments, you may have this error :

```
Error: unable to verify the first certificate
```

To fix this issue, you can add your enterprise CA certificate to the trusted root certificate authorities by setting the `NODE_EXTRA_CA_CERTS` environment variable. See [Node.js documentation](https://nodejs.org/api/cli.html#cli_node_extra_ca_certs_file) for more information.

## Credits

Thanks to [HSO](https://github.com/hso-nn/d365-cli) for query options.

Thanks to Microsoft for persistence cache.
