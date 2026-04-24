# A&N LPMS — Azure Integration Reference

> **Owner:** Ahmad (Consultant/Developer)
> **Last updated:** 2026-04-18
> **Status:** Pre-migration — staging on Render.com
> **Go-live target:** v1.0.0 on Azure App Service

This file is the single source of truth for all Azure and Microsoft 365 integration work.
Read this before touching any Microsoft-related configuration.
Cross-reference `SECURITY.md` for security rules — do not duplicate them here.

---

## Why Azure

| Reason | Detail |
|--------|--------|
| Microsoft ecosystem | Firm already uses Microsoft 365 Business Standard |
| SSO alignment | Staff log in with existing Microsoft work accounts — no new passwords |
| Outlook Calendar | Microsoft Graph API only available via Azure app registration |
| Enterprise compliance | Azure meets legal sector data residency and compliance requirements |
| Future scalability | Azure App Service scales without infrastructure changes |

**Decision date:** April 2026
**Alternative considered:** Remain on Render.com permanently
**Why rejected:** Render cannot support Microsoft SSO or Outlook Calendar integration

---

## Phase Overview

This integration happens in three distinct phases. Never mix work from different phases in the same session.

| Phase | What | Unlocks | Status |
|-------|------|---------|--------|
| A | App Registration + Microsoft SSO | Staff can log in with Microsoft accounts | ⏳ Pending |
| B | Migration from Render to Azure App Service | Production go-live (v1.0.0) | ⏳ Pending |
| C | Outlook Calendar via Microsoft Graph API | Calendar sync with cases and hearings | ⏳ Pending |

---

## Phase A — App Registration & Microsoft SSO

### What the client must do (one time only)

These steps require the firm's Global Admin. We guide — they execute. We never touch their admin account.

1. Go to `portal.azure.com` → Microsoft Entra ID → App Registrations → New Registration
2. Name the app: `AN-LPMS`
3. Set supported account type: **Single tenant** (this tenant only)
4. Set redirect URI: `https://[production-domain]/api/auth/callback/azure-ad`
5. After registration, go to API Permissions and grant exactly the permissions listed below
6. Go to Certificates & Secrets → New client secret → copy the value immediately (shown once only)
7. Share with Ahmad: **Client ID** and **Tenant ID** only — never share the Client Secret over WhatsApp or email

### Minimum permissions — exactly these, nothing more

| Permission | Type | Why |
|------------|------|-----|
| `openid` | Delegated | Verify user identity on login |
| `profile` | Delegated | Get name and email for display inside LPMS |
| `Calendars.ReadWrite` | Delegated | Read and write Outlook calendar events (Phase C) |

### Permissions we explicitly refuse

| Permission | Reason refused |
|------------|---------------|
| `Mail.Read` / `Mail.ReadWrite` | LPMS has no email functionality |
| `Files.Read` / `Files.ReadWrite` | LPMS does not access SharePoint or OneDrive |
| `User.ReadWrite.All` | We do not manage Microsoft user accounts |
| `Directory.ReadWrite.All` | We do not manage the tenant directory |
| `Global Administrator role` | Never required, never requested |

### Environment variables added in Phase A

```
AZURE_AD_CLIENT_ID=        # From app registration — Client ID
AZURE_AD_TENANT_ID=        # From app registration — Tenant ID
AZURE_AD_CLIENT_SECRET=    # Generated in Certificates & Secrets — never share
NEXTAUTH_URL=              # Production URL (update from Render URL)
NEXTAUTH_SECRET=           # Strong random string — generate with: openssl rand -base64 32
```

> Never commit these to GitHub. Add to Azure App Service environment variables only.

### Done when

- [ ] App registered in Microsoft Entra ID
- [ ] Only the 3 minimum permissions granted and admin-consented
- [ ] Staff can log in to LPMS using their Microsoft work email
- [ ] Cookie-based dev auth disabled in production build
- [ ] SECURITY.md SSO checklist item marked complete

---

## Phase B — Migration from Render to Azure App Service

### Pre-migration checklist

- [ ] GitHub repo set to private
- [ ] All Phase 1 modules tested and stable on staging
- [ ] Azure App Service plan created (B1 or higher — see cost section)
- [ ] Azure Database for PostgreSQL created and connection string ready
- [ ] All environment variables configured in Azure App Service settings
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate enabled (Azure provides this automatically)

### Migration steps

1. Create Azure App Service (Node 20, Linux)
2. Create Azure Database for PostgreSQL — Flexible Server
3. Set all environment variables in Azure → App Service → Configuration
4. Connect GitHub repo to Azure App Service for deployment
5. Run `prisma db push` against Azure PostgreSQL (via deployment script)
6. Run seed script to create initial admin user
7. Smoke-test all modules on Azure URL before switching DNS
8. Keep Render.com live until Azure is confirmed stable (minimum 48 hours)
9. Switch DNS to Azure URL
10. Shut down Render.com only after 1 week of stable Azure operation

### Rollback plan

If Azure migration breaks anything:

1. Do not shut down Render.com during migration — it stays live as fallback
2. Revert DNS to Render URL — this takes effect within minutes
3. Identify the issue, fix on Azure, re-test before switching DNS again
4. Document what went wrong in the Incident Log in `SECURITY.md`

> Migration should be done during off-hours — evenings or weekends. Never during a working day.

### Done when

- [ ] LPMS live on Azure URL
- [ ] All modules functioning identically to Render staging
- [ ] Microsoft SSO working for all staff accounts
- [ ] Render.com decommissioned after 1-week stable period
- [ ] ROADMAP.md updated to v1.0.0

---

## Phase C — Outlook Calendar Integration

> Phase C cannot start until Phase A and Phase B are both complete.

### What it does

- Cases with hearing dates appear as events in assigned lawyer's Outlook calendar
- Calendar reminders sync to LPMS notification system
- New hearings created in LPMS are written to Outlook automatically

### Microsoft Graph API endpoints used

| Action | Endpoint |
|--------|----------|
| List calendar events | `GET /me/calendar/events` |
| Create calendar event | `POST /me/calendar/events` |
| Update calendar event | `PATCH /me/calendar/events/{id}` |
| Delete calendar event | `DELETE /me/calendar/events/{id}` |

### Testing protocol

1. Create a dedicated test Microsoft account within the firm's tenant
2. All Graph API testing is done against this test account only
3. Never write test data to a partner's real Outlook calendar
4. Only connect real accounts after test account confirms full functionality

### Done when

- [ ] Hearing dates from Cases module appear in assigned lawyer's Outlook calendar
- [ ] Changes in LPMS reflect in Outlook within 60 seconds
- [ ] Calendar reminders appear in LPMS Notifications module
- [ ] Test account decommissioned after go-live confirmed

---

## Cost Reference

| Service | Tier | Estimated cost |
|---------|------|----------------|
| Azure App Service | B1 (1 core, 1.75GB RAM) | ~SAR 90–130/month |
| Azure Database for PostgreSQL | Flexible Server, Burstable B1ms | ~SAR 70–100/month |
| SSL Certificate | Included with App Service | Free |
| Microsoft Entra ID (SSO) | Included in M365 Business Standard | Free |
| Outlook Calendar API | Included in M365 Business Standard | Free |
| **Total estimated** | | **~SAR 160–230/month** |

> Render.com staging (~SAR 65/month) can be decommissioned after go-live to offset Azure cost.

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-18 | Single tenant app registration | Firm users only — no external login needed |
| 2026-04-18 | Minimum 3 permissions only | Reduce attack surface, maintain client trust |
| 2026-04-18 | Client Secret never shared over messaging | Security — goes directly into Azure env vars |
| 2026-04-18 | Keep Render live during migration | Rollback safety — switch DNS only when Azure stable |
| 2026-04-18 | Phase C requires Phase A + B complete | Calendar API requires SSO + production environment |
| 2026-04-18 | Invoicing links to external accounting system | Not standalone — integration approach TBD once accounting system confirmed |

---

## Security Rules

See `SECURITY.md` for the full security checklist.
Azure-specific rules that are non-negotiable:

- Never ask for or accept the Global Admin password
- Never share Client Secret over WhatsApp, email, or any messaging platform
- Never grant permissions beyond the 3 listed above
- Never test Graph API against real partner Outlook accounts
- Never decommission Render before Azure is confirmed stable for 1 week
- Never store Azure credentials in code — environment variables only

---

## Contacts & Access

| Role | Person | What they control |
|------|--------|------------------|
| Developer / Consultant | Ahmad | Azure App Service, GitHub, env vars |
| Global Admin (firm) | Dr. Nawaf or delegate | Microsoft Entra ID, app registration approval |
| Firm partners | Dr. Nawaf, Mr. Abdullah | Final approval on go-live |

---

## Status Tracker

| Item | Date completed | Notes |
|------|---------------|-------|
| Phase A — App registration | ⏳ | Awaiting Global Admin confirmation from Dr. Nawaf |
| Phase A — SSO live | ⏳ | |
| Phase B — Azure App Service created | ⏳ | |
| Phase B — Migration complete | ⏳ | |
| Phase B — Render decommissioned | ⏳ | |
| Phase C — Calendar sync live | ⏳ | |
| v1.0.0 go-live | ⏳ | |
