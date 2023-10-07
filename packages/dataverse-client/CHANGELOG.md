# @primno/dataverse-client

## 0.10.0

### Minor Changes

- a27f4d7: Node v18+ is now required.

## 0.9.0

### Minor Changes

- 0f98b6e: This repository becomes a monorepo. The authentication and the client have been separated in 2 packages:

  - @primno/dataverse-client
  - @primno/dataverse-auth

  Fixed:

  - User name verification for flow device code now works as expected.

  Features:

  - Default service and account application in the persistence cache.
  - Generating the orderby in the query when using MultipleQueryOptions
