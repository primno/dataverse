# Dataverse Client for Node.JS

[![npm](https://img.shields.io/npm/v/@primno/dataverse-client.svg)](https://www.npmjs.com/package/@primno/dataverse-client)
[![npm](https://img.shields.io/npm/l/@primno/dataverse-client.svg)](https://github.com/primno/dataverse/blob/main/LICENSE)
![build](https://img.shields.io/github/actions/workflow/status/primno/dataverse/test.yml)
![node-current](https://img.shields.io/node/v/@primno/dataverse-client)

dataverse-client is library for Node.JS to make WebAPI requests to Dataverse and Dynamics 365 CE (on-premises).

dataverse-client provides a [Query builder](#queries) to build OData queries.

Works with a token provider. Use [`@primno/dataverse-auth`](https://www.npmjs.com/package/@primno/dataverse-auth) to authenticate with a Connection String or OAuth2.

> This package is part of the [Primno](https://primno.io) framework.

## Compatibility

dataverse-client works with Dataverse (Dynamics 365 Online) and Dynamics 365 CE (on-premises).

## Quick start

### Installation
```bash
  npm install @primno/dataverse-client @primno/dataverse-auth
```

### Usage

With a connection string:

```ts
import { DataverseClient } from '@primno/dataverse-client';
import { ConnStringTokenProvider } from '@primno/dataverse-auth';

const tokenProvider = new ConnStringTokenProvider(
    "AuthType=OAuth;Url=https://<Environnement>.crm.dynamics.com;UserName=<UserName>;TokenCacheStorePath=./.cache/token.json",
    {
        oAuth: {
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
import { DataverseClient } from '@primno/dataverse-client';
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

const client = new DataverseClient(tokenProvider);

const accounts = await client.retrieveMultipleRecords("accounts", { top: 10 });
console.log(accounts);
```

## Authentication

`@primno/dataverse-client` needs a token provider to authenticate with Dataverse.
Use [`@primno/dataverse-auth`](https://www.npmjs.com/package/@primno/dataverse-auth) to authenticate with a Connection String or OAuth2.

You can also use your own token provider by implementing the `TokenProvider` interface.

To learn more about available authentication methods, see the `@primno/dataverse-auth` [documentation](https://www.npmjs.com/package/@primno/dataverse-auth).

## Queries

The following methods are available to query Dataverse:
- `retrieveMultipleRecords`: Retrieves a set of records.
- `retrieveRecord`: Retrieves a single record by its id.
- `createRecord`: Creates a record.
- `updateRecord`: Updates a record by its id.
- `deleteRecord`: Deletes a record by its id.
- `executeAction`: Executes an action.

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