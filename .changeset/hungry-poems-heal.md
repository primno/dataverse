---
"@primno/dataverse-client": minor
"@primno/dataverse-auth": minor
---

This repository becomes a monorepo. The authentication and the client have been separated in 2 packages:

- @primno/dataverse-client
- @primno/dataverse-auth

Fixed: 
- User name verification for flow device code now works as expected.

Features:
- Default service and account application in the persistence cache.
- Generating the orderby in the query when using MultipleQueryOptions