# Subscriptly

**Live App:** [https://subscriptly-topaz.vercel.app](https://subscriptly-topaz.vercel.app)

A privacy-first subscription command center to track renewals, intro offers, coupon savings, payment methods, and recurring spend — with zero cloud tracking and zero bank logins required.

---

## Features

- **Renewal Calendar & Timeline:** Overview of upcoming charges across days, weeks, and months to prevent surprise renewals.
- **Intro & Promotional Tracking:** Track free-trial conversion dates, coupon expirations, and discount periods before regular pricing starts.
- **Payment Method Allocation:** Map subscriptions to specific credit cards or payment accounts to monitor card-level liabilities.
- **Spend Projections & Analytics:** Normalized monthly and annual spend calculations, category breakdowns, and cost distribution.
- **100% Privacy-First:** Data stays entirely on your device in `localStorage`. No accounts, no third-party analytics, and full JSON data backup/restore.

## Tech Stack

- **Framework:** Vanilla JavaScript + [Alpine.js](https://alpinejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Storage:** Browser `localStorage` & Web APIs
- **Hosting:** [Vercel](https://vercel.com)

## Local Development

Serve the `public/` directory using any static file server:

```bash
# Using Python
cd public && python3 -m http.server 8000

# Using Node / npx serve
npx serve public
```
