# @primno/dataverse-auth

## 0.6.1

### Patch Changes

- 0a7c7a7: The default client id for OAuth2 becomes Sample Client Id (51f81489-12ee-4a9e-aaae-a2591f45987d)

## 0.6.0

### Minor Changes

- 0f98b6e: This repository becomes a monorepo. The authentication and the client have been separated in 2 packages:

  - @primno/dataverse-client
  - @primno/dataverse-auth

  Fixed:

  - User name verification for flow device code now works as expected.

  Features:

  - Default service and account application in the persistence cache.
  - Generating the orderby in the query when using MultipleQueryOptions
