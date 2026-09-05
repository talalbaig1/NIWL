# NIWL deploy (owner only)

Do not deploy this site and do not activate the waitlist workflow until the owner says so. Use the Vercel **default domain** only. No custom domain.

## 1. Private Google Sheet

Create a private sheet. Do not share it publicly.

Tab name: `waitlist`

Header row, in this order:

`timestamp_riyadh` | `name` | `email` | `country` | `source` | `user_agent_hash`

Paste the sheet ID into the NIWL waitlist workflow Append or update row node. The scaffold still has the placeholder `OWNER_PASTE_SHEET_ID` until you do this.

A Google Sheets OAuth credential for `talalbaig@gmail.com` already exists. You do not need a new one unless you want a different Google account.

## 2. Waitlist webhook credential

Create a new Header Auth credential named `NIWL waitlist webhook`:

- Header: `X-NIWL-Secret`
- Value: the same string as `WAITLIST_SHARED_SECRET`

Bind that credential on the NIWL waitlist webhook. Remove the current Serper `X-API-KEY` bind.

## 3. Waitlist workflow settings (UI only)

On the existing NIWL waitlist intake workflow, in the UI:

- timezone: `Asia/Riyadh`
- executionTimeout: `300`
- errorWorkflow: `X7zKL3wTFPIhwyaN`
- availableInMCP: `true`
- Active: **OFF**

Do not turn it on from this repository.

## 4. Vercel project (when the owner asks)

1. Import this GitHub repo.
2. Leave it on the default `*.vercel.app` domain.
3. Set two env names (values never go in git):

```
WAITLIST_SHARED_SECRET
N8N_WAITLIST_WEBHOOK_URL
```

`N8N_WAITLIST_WEBHOOK_URL` is the production waitlist path `/webhook/niwl-waitlist` on the existing host. Do not write that hostname into this repo.

4. Deploy only when the owner says. After deploy, an inactive production webhook should still 404. The function must still return generic `{ok:true}` and must not leak that error.

## 5. Do not do these

- Do not activate the waitlist workflow.
- Do not run the credential self-identify workflow again.
- Do not add Telegram, Apollo, or a database node.
- Do not put secrets, sheet IDs, or hostnames in git.
