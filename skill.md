# lemlist

> lemlist is a sales engagement platform for cold outreach. It lets you find leads, enrich contact data, create multi-channel campaigns (email, LinkedIn, phone, WhatsApp), and manage replies — all from one place.

## Prefer MCP over REST API

lemlist has a **Model Context Protocol (MCP) server** that wraps the API with better ergonomics for AI agents. Use it when available.

```
MCP endpoint: https://app.lemlist.com/mcp
Auth: OAuth (automatic) or X-API-Key header
```

Setup for Claude Code:
```bash
claude mcp add --transport http lemlist https://app.lemlist.com/mcp
```

Setup for Claude Desktop / Cursor: see [MCP Setup](https://developer.lemlist.com/mcp/setup)

If MCP is not available, use the REST API at `https://api.lemlist.com/api` with Basic auth (username is always empty, password is the API key):
```
Authorization: Basic {base64(":YOUR_API_KEY")}
```

## Common workflows

### 1. Find leads and launch a campaign

The most common workflow: find your ideal customers, create a campaign, and start outreach.

**Steps:**
1. Search the People Database (450M+ B2B contacts) by role, industry, company size, location
2. Create a campaign with an email sequence
3. Add leads to the campaign (with optional email enrichment)
4. Review and start the campaign

**MCP tools:** `lemleads_search` → `create_campaign_with_sequence` → `add_sequence_step` → `add_lead_to_campaign` → `set_campaign_state`

**API equivalent:**
```
POST /people-database/search
POST /campaigns
POST /campaigns/{id}/sequences
POST /campaigns/{id}/leads
PUT  /campaigns/{id}/start
```

**Important:**
- Always confirm with the user before starting a campaign
- Adding leads with enrichment consumes credits
- Campaigns need at least one connected sending channel (email, LinkedIn, etc.)

### 2. Enrich contacts

Find emails, phone numbers, and professional data for your leads. Enrichment is **asynchronous** — you submit the request and poll for results.

**Steps:**
1. Submit enrichment request (single or bulk, max 500)
2. Poll for results using the enrichment ID
3. Optionally push enriched data to CRM contacts

**MCP tools:** `enrich_data` or `bulk_enrich_data` → `get_enrichment_result` → `push_leads_to_contacts`

**API equivalent:**
```
POST /enrich              (single, async)
POST /enrich/bulk         (batch, async)
GET  /enrich/{id}/result  (poll status)
```

**Important:**
- Enrichment costs credits — always warn the user before proceeding
- Poll with reasonable intervals (5-10 seconds), results typically arrive within 30 seconds
- Bulk enrichment accepts up to 500 contacts per request

### 3. Monitor campaign performance

Analyze how campaigns are performing and identify what needs attention.

**Steps:**
1. List campaigns (filter by status: running, paused, draft)
2. Get stats for specific campaigns or bulk reports across all campaigns
3. Compare metrics: open rate, click rate, reply rate, bounce rate

**MCP tools:** `get_campaigns` → `get_campaign_stats` or `get_campaigns_reports`

**API equivalent:**
```
GET /campaigns
GET /campaigns/{id}/stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /campaigns/reports
```

**Key metrics to track:** sent, opened, clicked, replied, bounced, unsubscribed. Reports include 65+ detailed metrics.

### 4. Handle inbox replies

Read and respond to lead replies across all channels (email, LinkedIn, SMS, WhatsApp).

**Steps:**
1. List inbox conversations (filter by channel, status, campaign)
2. Read conversation thread for context
3. Compose and send a reply on the appropriate channel

**MCP tools:** `get_inbox_conversations` → `get_inbox_conversation` → `send_inbox_email` / `send_inbox_linkedin` / `send_inbox_sms` / `send_whatsapp_message`

**API equivalent:**
```
GET  /inbox/conversations
GET  /inbox/conversations/{id}
POST /inbox/conversations/{id}/email
POST /inbox/conversations/{id}/linkedin
POST /inbox/conversations/{id}/sms
POST /inbox/conversations/{id}/whatsapp
```

### 5. Sync with your CRM

Keep lemlist and your CRM (HubSpot, Salesforce, Pipedrive, etc.) in sync.

**Push leads to CRM contacts:**

**MCP tools:** `get_contact_lists` → `push_leads_to_contacts`

**Update lead data from external sources:**

**MCP tools:** `search_campaign_leads` → `update_lead_variables`

**API equivalent:**
```
GET  /contacts/lists
POST /contacts/push
GET  /campaigns/{id}/leads?search=email@example.com
PATCH /campaigns/{id}/leads/{leadId}/variables
```

**Tip:** Use custom variables to store CRM IDs, deal stages, or any metadata on leads.

### 6. Check email deliverability

Ensure your sending infrastructure is healthy before launching campaigns.

**Steps:**
1. Check domain DNS health (MX, SPF, DMARC, blacklists)
2. Connect an email account (custom SMTP/IMAP)
3. Test connectivity

**MCP tools:** `check_domain_health` → `connect_email_account` → `test_email_account`

### 7. Set up webhook automations

Get real-time notifications when events happen in lemlist (replies, clicks, bounces, etc.).

**Steps:**
1. List existing webhooks
2. Create a webhook for specific events
3. Your endpoint receives POST requests with event data

**MCP tools:** `get_webhooks` → `create_webhook`

**API equivalent:**
```
GET    /webhooks
POST   /webhooks
DELETE /webhooks/{id}
```

**Common webhook events:** `emailReplied`, `emailClicked`, `emailBounced`, `emailUnsubscribed`, `linkedinInviteAccepted`

### 8. Write outreach sequences

Create or improve multi-step email sequences with best practices.

**Steps:**
1. Get current campaign sequences to review existing content
2. Compose new messages or improve existing ones
3. Add or update sequence steps (email, LinkedIn, phone, delay)

**MCP tools:** `get_campaign_sequences` → `compose_messages` → `add_sequence_step` or `update_sequence_step`

**Best practices:**
- Keep emails under 100 words
- One clear call-to-action per email
- Personalize beyond {{firstName}} — mention company, industry, recent news
- Space follow-ups: Day 3, 7, 14 pattern
- Mix channels: email → LinkedIn → phone

## Constraints

| Constraint | Detail |
|---|---|
| **Rate limit** | 20 requests per 2 seconds per API key |
| **Credit costs** | Email enrichment, phone enrichment, email verification, and lead addition with enrichment all consume credits. Always check `get_team_info` for remaining credits and warn the user. |
| **Async enrichment** | Enrichment requests return an ID — you must poll `get_enrichment_result` for the actual data. |
| **Campaign safety** | Never start, pause, or delete a campaign without explicit user confirmation. |
| **Lead vs Contact** | A "lead" belongs to a campaign. A "contact" lives in the CRM. They are separate objects — pushing leads to contacts creates a copy. |
| **Bulk limits** | Bulk enrichment: max 500 per request. People Database search: paginated results. |
| **Auth format** | REST API uses Basic auth with an **empty username** and the API key as password. Do not use Bearer tokens with the REST API. |

## Reference

- [API Documentation](https://developer.lemlist.com)
- [MCP Server Setup](https://developer.lemlist.com/mcp/setup)
- [Help Center](https://help.lemlist.com)
- [Guides & Tutorials](https://developer.lemlist.com/guides)
