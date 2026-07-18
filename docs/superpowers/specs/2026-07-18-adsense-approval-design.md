# AdSense Approval Design — Throttle LK

**Date:** 2026-07-18  
**Site:** https://throttlelk.online/  
**Rejection reasons:** Ads on screens without publisher content; Low value content

## Goals

1. Stop AdSense from loading on thin/utility screens (checkout, admin).
2. Add trust pages: About, Contact, Privacy, Terms.
3. Add substantial original content via a backend-driven CMS blog (6–8 seeded articles).
4. Expand Motor Garage beyond an empty “Coming Soon” stub.
5. Cookie notice linking to Privacy Policy.

## Architecture

- **Ads:** Remove global AdSense from `index.html`. Load script only on allowlisted routes via a React component.
- **Trust pages:** Static React routes (not CMS).
- **Articles:** New Nest `ArticlesModule` (Products pattern) + Admin CRUD + public `/blog` + `/blog/:slug`.
- **Seed:** On empty `articles` table, insert 6–8 published long-form guides.

## AdSense allowlist

**Ads OK:** `/`, `/product/:slug`, `/blog`, `/blog/:slug`, `/about`, `/contact`, `/privacy`, `/terms`  
**No ads:** `/checkout`, `/admin/*`

## Article entity

`id`, `title`, `slug` (unique), `excerpt`, `body` (markdown), `coverImage` (nullable), `authorName`, `status` (`draft`|`published`), `publishedAt`, `createdAt`, `updatedAt`

## Out of scope

Comments, tags taxonomy, rich WYSIWYG, WordPress subdomain, checkout changes.
