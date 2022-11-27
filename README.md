# Dynamics 365 Client for Node.JS

[![npm](https://img.shields.io/npm/v/@primno/d365-client.svg)](https://www.npmjs.com/package/@primno/d365-client)
[![npm](https://img.shields.io/npm/l/@primno/d365-client.svg)](https://github.com/primno/d365-client/blob/main/LICENSE)

d365-client is a library written in Typescript that allows you to make requests to the Dynamics 365 / Dataverse APIs in Node.JS.

Dynamics 365 CE (on-premises) and Dynamics 365 Online are supported.

Dynamics 365 CE (on-premises) is supported since version 9.0 with CBA/IFD deployment (ADFS 2019+ only with OAuth enabled).

> **Important**
> d365-client is in beta stage and subject to change.

## Installation
```powershell
  npm install @primno/d365-client
```

## Authentication

d365-client works with historical connection strings (see [D365 online doc](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/xrm-tooling/use-connection-strings-xrm-tooling-connect) and [D365 CE on-premises doc](https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/developer/xrm-tooling/use-connection-strings-xrm-tooling-connect?view=op-9-1)).

### Supported authentication type

| Auth type                          | Online             | On-premises        |
|------------------------------------|--------------------|--------------------|
| OAuth                              | :heavy_check_mark: | :heavy_check_mark: |
| AD                                 | :x:                | :heavy_check_mark: |
| Certificate                        | :x:                | :x:                |

### Examples :

Dynamics 365 Online : `AuthType=OAuth;Url=https://<Environnement>.crm.dynamics.com;UserName=<UserName>;Password=<Password>`

Dynamics 365 CE (on-premise) OAuth : `AuthType=OAuth;RedirectUri=<RedirectUri>;ClientSecret=<ClientSecret>;Url=https://<D365Url>;UserName=<Domain>\<UserName>;Password=<Password>`

Dynamics 365 CE (on-premise) AD (NTLM authentication): `AuthType=AD;Url=https://<D365Url>;UserName=<AdUserName>;Domain=<Domain>;Password=<Password>`

## Queries

CRUD and execute operations are supported.

### Example

The following code returns the first 10 accounts.

```ts
import { D365Client } from '@primno/d365-client';

interface Account {
    name: string;
    emailaddress1: string;
}

const connectionString = '...';
const d365Client = new D365Client(connectionString);

const accounts = await d365Client.retrieveMultipleRecords<Account>(
    "accounts",
    {
        top: 10,
        select: ["name", "emailaddress1"],
        orders: [{ attribute: "name", order: "asc" }]
    }
);
```

The following code returns all contacts using OData pagination. The page size is set to 50. The nextLink attribute is used to get the next page.

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

## Credits

Thanks to [HSO](https://github.com/hso-nn/d365-cli) for query options.

Thanks to Microsoft for persistence cache.