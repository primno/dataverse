# Dataverse Client for Node.JS

[![npm](https://img.shields.io/npm/v/@primno/dataverse-client.svg)](https://www.npmjs.com/package/@primno/dataverse-client)
[![npm](https://img.shields.io/npm/l/@primno/dataverse-client.svg)](https://github.com/primno/dataverse-client/blob/main/LICENSE)

dataverse-client is a library written in Typescript that allows you to make requests to the Dataverse / Dynamics 365 APIs in Node.JS.

Dynamics 365 Online and Dynamics 365 CE (on-premises) are supported.

Dynamics 365 CE (on-premises) is supported since version 9.0 with CBA/IFD deployment (ADFS 2019+ only with OAuth enabled).

> **Important**
> dataverse-client is in beta stage and subject to change.

## Installation
```bash
  npm install @primno/dataverse-client
```

## Authentication

dataverse-client works with connection strings (see [Dataverse doc](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/xrm-tooling/use-connection-strings-xrm-tooling-connect) and [D365 CE on-premises doc](https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/developer/xrm-tooling/use-connection-strings-xrm-tooling-connect?view=op-9-1)).

Persistence token cache is supported for Dataverse.

### Supported authentication type

| Auth type                          | Online             | On-premises        |
|------------------------------------|--------------------|--------------------|
| OAuth                              | :heavy_check_mark: | :heavy_check_mark: |
| AD                                 | :x:                | :heavy_check_mark: |
| Certificate                        | :x:                | :x:                |

### Examples :

Dataverse : `AuthType=OAuth;Url=https://<Environnement>.crm.dynamics.com;UserName=<UserName>;Password=<Password>`

Dynamics 365 CE (on-premise) OAuth : `AuthType=OAuth;RedirectUri=<RedirectUri>;ClientSecret=<ClientSecret>;Url=https://<D365Url>;UserName=<Domain>\<UserName>;Password=<Password>`

Dynamics 365 CE (on-premise) AD (NTLM authentication): `AuthType=AD;Url=https://<D365Url>;UserName=<AdUserName>;Domain=<Domain>;Password=<Password>`

## Queries

CRUD and execute operations are supported.

### Examples

1. Retrieves first 10 accounts.

    ```ts
    import { DataverseClient } from '@primno/dataverse-client';

    interface Account {
        name: string;
        emailaddress1: string;
    }

    const connectionString = '...';
    const client = new DataverseClient(connectionString);

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

1. Retrieves actives opportunies using a custom query option string.

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

## Credits

Thanks to [HSO](https://github.com/hso-nn/d365-cli) for query options.

Thanks to Microsoft for persistence cache.