# Dynamics 365 Client for NodeJS

d365-client is a library written in Typescript that allows you to make requests to the Dynamics 365 APIs in NodeJS.

Dynamics 365 CE (on-premises) and Dynamics 365 Online are supported.

Dynamics 365 CE (on-premises) is supported since version 9.0 with CBA/IFD deployment (ADFS 2019+ only).

## Connection string

d365-client works with historical connection strings (see [D365 online doc](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/xrm-tooling/use-connection-strings-xrm-tooling-connect) and [D365 CE on-premises doc](https://learn.microsoft.com/en-us/dynamics365/customerengagement/on-premises/developer/xrm-tooling/use-connection-strings-xrm-tooling-connect?view=op-9-1)).

Only OAuth and AD (for on-premises) are supported.

### Examples :
Dynamics 365 CE (on-premise) : `AuthType=OAuth;RedirectUri=<RedirectUri>;ClientSecret=<ClientSecret>;Url=https://<D365Url>;UserName=<Domain>\<UserName>;Password=<Password>`

Dynamics 365 Online : `AuthType=OAuth;Url=https://<Environnement>.crm4.dynamics.com;UserName=<UserName>;Password=<Password>`

## Queries

d365-client support CRUD and execute operations.

### Exemple of usage

The following code returns the first 10 accounts whose names contain the letter A.

```ts
import { D365Client } from '@primno/d365-client';

interface Account {
    name: string;
    emailaddress1: string;
}

const connectionString = '...';
const d365Client = new D365Client(connectionString);

const accounts = await d365Client.retrieveMultipleRecords<Account>(
    "account",
    {
        top: 10,
        filters: [{ conditions: [{ attribute: "name", operator: "Contains", value: "A" }] }],
        select: ["name", "emailaddress1"],
    }
);
```
