# `@difinity-echo/test-fixtures`

Safe, **synthetic** contract fixtures shared by every division's tests. They
contain no real secrets, source code, customer data or personal information;
prohibited-content examples use the marker `SYNTHETIC-PROHIBITED-CONTENT-NOT-REAL`.
A unit test scans all fixtures for credential- and e-mail-like patterns.

| Family                                               | Purpose                                                                                                           |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `canonical-events/valid`, `canonical-events/invalid` | Envelope acceptance and rejection (missing idempotency key, unknown version, malformed id, nested vendor payload) |
| `prohibited-content/`                                | Prompt, file path, command and transcript fields must be rejected                                                 |
| `tenant-isolation/`                                  | Payload/query tenant claims must be rejected                                                                      |
| `admission/`, `query/`                               | Acknowledgement and response-envelope semantics (absence vs failure)                                              |
| `health/`                                            | Liveness/readiness examples, including leaked raw causes (rejected)                                               |

`fixtures/catalogue.json` registers every file with its contract `$id`,
expected outcome and reason; unregistered files fail the tests. Entries whose
reason starts with **`KNOWN GAP`** document behaviour a structural schema
cannot enforce (e.g. prohibited content inside an innocuously named
attribute). Milestone 1 must turn each into a rejection test at the local
privacy allowlist or admission boundary.

```ts
import { fixtureCatalogue, loadFixture } from "@difinity-echo/test-fixtures"
```
