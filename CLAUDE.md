# Repo guidelines for AI agents

**This is a public API documentation repo.** Everything you write lands on
https://developer.lemlist.com and is visible on GitHub to anyone. Treat every
edit as if you were publishing it to the internet — because you are.

## Never paste real data into samples

When writing example payloads (OpenAPI `example` fields, MDX code blocks,
JSON responses, email HTML bodies), use **obvious placeholders only**. Never
copy from real API responses, production dumps, your own lemlist workspace,
or a teammate's workspace.

### What counts as real data (forbidden)

- Any email on a lemlist-owned domain, except the public `support@lemlist.com`.
- First or last names of real people (lemlist employees, lemlist customers,
  anyone you encountered in a real API response).
- Entity IDs that look real — i.e. a `<prefix>_<random mixed-case string>` that
  doesn't contain an obvious-fake marker (`Example`, `Fake`, `A1B2C3`, repeated
  digits like `123`, etc.). If it looks like something a production system
  would emit, assume it is.
- Real company names / domains / LinkedIn handles / calendar handles / S3
  URLs / webhook URLs — anything you could copy from an enrichment response
  or a tracking link.
- Real email thread content, message bodies, subject lines.

### Placeholder conventions (use these)

| Kind | Placeholder |
|---|---|
| Entity ID | `<prefix>_Example<Entity>0N` — e.g. `cam_ExampleCampaign01`, `usr_ExampleUser02`, `seq_ExampleSequence01` |
| Email | `john@example.com`, `jane@example.com`, `alex@example.com` |
| Name | John Doe, Jane Smith, Alex Johnson |
| Company | Acme Inc, Example Corp |
| Domain | `example.com`, `acme.com` |
| URL | `https://example.com/...` |

Use a small pool of 2–4 distinct placeholders per entity type so arrays
still look varied (`ExampleCampaign01`, `02`, `03`, `04`).

## If you're adapting a real API response

Run through this checklist before committing:

1. Replace every ID with `<prefix>_Example<Entity>0N`.
2. Replace every email with an `@example.com` variant.
3. Replace every first/last name with a generic (John Doe, Jane Smith, …).
4. Replace real company names, URLs, domains, LinkedIn slugs, webhook URLs.
5. Read your full diff line by line before committing. If any string feels
   like it could point back to a real person, team, or system — replace it.

## Why this matters

Past samples in this repo leaked employee names, personal emails, and
production entity IDs — scraped from real API responses and pasted into
OpenAPI samples. Those samples are public the moment they are pushed.
There is no CI gate that can un-publish a leaked commit on a public repo.
Prevention is the only control.
