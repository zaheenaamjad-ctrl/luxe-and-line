---
name: Luxe & Line web stack notes
description: Durable decisions and known quirks for the Luxe & Line web app
---

# Luxe & Line — web stack notes

## Email delivery
**Rule:** RESEND_API_KEY must be set in environment secrets or emails silently do nothing (no error thrown).
**Why:** The mailer initialises once at startup; if the key is absent the send calls are no-ops.
**How to apply:** If the user reports missing order/welcome emails, check RESEND_API_KEY in the Secrets panel first, then restart the API server.

## Product category filtering
**Rule:** The API's category filter uses case-insensitive comparison (`toLowerCase`).
**Why:** Product categories are stored lower-case in the DB but URL params can arrive in any case.
**How to apply:** No need to normalise category params before passing them to the API client.
