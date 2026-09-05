# NIWL architecture

```
Browser (index.html)
  POST /api/waitlist
    Vercel serverless isolate
      validate email shape
      drop filled honeypot (`website`)
      in-memory rate limit (5 / 15 min / first x-forwarded-for hop)
      if WAITLIST_SHARED_SECRET or N8N_WAITLIST_WEBHOOK_URL is missing: do not forward
      else POST JSON to the waitlist webhook with header X-NIWL-Secret
    Private Google Sheet tab `waitlist`
```

## Public page

- Language is **early access list**, not sign-up.
- Copy is limited to LEAP 2026 (31 August–2 September) collection: business cards, event photos, voice notes.
- Form fields: name, email, country. Hidden honeypot: `website`.
- Button: “Join the early access list”.
- The browser only calls `/api/waitlist`. The webhook URL stays on the server.

## Function rules

- Email must look like `local@domain.tld`.
- A filled honeypot returns `{ok:true}` and does not forward.
- Rate limit lives in a `Map` on that isolate. It is not shared across isolates or regions. A cold start clears it.
- Missing env names, a failed upstream POST, or any other backend error still return `{ok:true}`. Upstream errors are not sent to the client.

## What this repo does not include

- No Telegram, Apollo, or database nodes.
- No custom domain instructions.
- No activation of the waitlist workflow.
