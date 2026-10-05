# Domain-Driven Design documentation

The Difinity standard (§4.4) requires this documentation set **before**
business implementation in any bounded context:

```text
docs/ddd/
  context-map.md        bounded contexts, external systems and their relationships
  domain-terms.md       ubiquitous-language glossary with aliases to avoid
  bc-{name}.md          one per bounded context: purpose, rules, driving/driven ports
  aggregates/aggregate-{name}.md
  acl/acl-{system}.md   one per external system (Cursor, Jira, GitHub, Sentry, ...)
docs/frontend/feature-map.md
```

**Status: not yet written.** Milestone 0 contains no business logic, so no
bounded context has been modelled. The first documents are due with
Milestone 1 (canonical event, privacy allowlist, admission and ingestion
health), and must:

- use the vocabulary of the [consolidated product brief](../reference/Difinity-Echo-Consolidated-Product-and-Architecture.md)
  and the [implementation brief](../product-briefs/ECHO_IMPLEMENTATION_PRODUCT_BRIEFS.md);
- mark working directions and open decisions explicitly instead of settling them;
- be reviewed by every affected division (see the
  [team delivery plan §6](../product-briefs/ECHO_TEAM_DELIVERY_PLAN.md#6-shared-contract-ownership)).

The PetPal examples in Appendix A of the standard illustrate the format only;
their business rules do not apply to Echo.
