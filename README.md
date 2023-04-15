# Dataverse libraries for Node.JS

![build](https://img.shields.io/github/actions/workflow/status/primno/dataverse/test.yml)

This repository is a monorepo to connect and make WebAPI requests to Dataverse / D365.

## Packages

| Name | Description |
| --- | --- |
| [@primno/dataverse-client](packages/dataverse-client/) | Dataverse / D365 client to make WebAPI requests. |
| [@primno/dataverse-auth](packages/dataverse-auth/) | Authentication with a connection String or OAuth2. Provides a persistent token cache. |