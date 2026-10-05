# `@difinity-echo/contracts`

Versioned, language-neutral Echo contracts. **JSON Schema (draft 2020-12) in
[`schemas/`](schemas) is the source of truth**; TypeScript types and embedded
schema constants in `src/generated/` are generated from it and checked for drift.

| Contract                              | Version      | Status                                                                  | Owner (team plan §6)             |
| ------------------------------------- | ------------ | ----------------------------------------------------------------------- | -------------------------------- |
| `common/error-code`                   | v1           | Foundation — typed error taxonomy from brief §13.2                      | Division 2                       |
| `common/safe-error`                   | v1           | Foundation — client-safe error (code, message, correlation id)          | Division 3 / 2                   |
| `events/canonical-event-envelope`     | **v0 draft** | Structural envelope only; event catalogue and allowlist are M1-01/M1-02 | Division 2 (reviewed by 1 and 3) |
| `admission/admission-acknowledgement` | **v0 draft** | Finalised in M1-06                                                      | Division 2 (reviewed by 1)       |
| `query/query-request-envelope`        | **v0 draft** | Envelope only; per-query schemas come with each milestone               | Division 2 (reviewed by 3)       |
| `query/query-response-envelope`       | **v0 draft** | Distinguishes `success` / `absent` / `failure`                          | Division 2 (reviewed by 3)       |

Health, readiness and correlation contracts live in
[`@difinity-echo/observability-contracts`](../observability-contracts).

## Rules encoded in the drafts

- No tenant field anywhere: tenancy is derived at authenticated admission or
  from the authenticated service call, never from payloads.
- Objects are closed (`additionalProperties: false`), so unexpected fields —
  including prohibited content — are rejected rather than forwarded.
- Attribute names that denote default-prohibited content (prompt, transcript,
  filePath, command, …) are rejected as **defence in depth only**. The local
  privacy allowlist (M1-02) is the actual privacy boundary; see the
  `KNOWN GAP` fixtures in `@difinity-echo/test-fixtures`.
- Validation issues report paths and schema reasons, never rejected values.

## Exports

- `Result`, `ok`, `err` — explicit expected-failure type (standard §7.2).
- `JsonValue`, `JsonSchemaDocument`.
- `createContractRegistry(schemas)` → `validator<T>(schemaId)` → `validate(input): Result<T, ContractValidationFailure>`.
- `contractsRegistry`, `contractSchemas`, `ContractId`, `errorCodes` and the generated types.

**Not here, by design:** database models, controllers, adapters, UI code or
storage-specific types.

## Changing a contract

1. Edit or add the JSON Schema (new major version → new file, e.g. `.v1.schema.json`).
2. `pnpm --filter @difinity-echo/contracts generate`
3. Add/adjust fixtures in `packages/test-fixtures` and run `./scripts/verify.sh`.
4. Get review from every affected division (team delivery plan §6).
