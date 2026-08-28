# PrismPlay ⚡ [ARCHIVED / DISCONTINUED]

> **Project Status:** **Discontinued / Proof-of-Concept Only.**  
> This project is no longer actively maintained or developed. It remains public strictly as boilerplate code and an architectural case study.

---

## Overview

**PrismPlay** was an experimental attempt to build a web-based media aggregator and streaming client inspired by the mobile app [Cloudstream](https://github.com/recloudstream/cloudstream).

The goal was to provide a Cloudstream-style user experience in the browser by pairing a **React (Vite + Tailwind CSS)** frontend with a containerized **Kotlin (Ktor)** JVM backend running in Docker to parse community extension repositories.

---

## Why the Project Was Dropped

Replicating Cloudstream's native mobile architecture inside a standard web browser and basic JVM environment introduces major technical roadblocks:

1. **Android Runtime Dependency:** Official Cloudstream extensions (`.cs3` packages) are compiled Dalvik/Dex bytecode designed specifically for Android. They rely on internal Android WebViews, OkHttp network interceptors, and custom decryption routines that cannot run directly inside a standard JVM container or web app.
2. **Cloudflare & Anti-Scraping Defenses:** Most media providers and file hosts implement JavaScript challenges, Turnstile, and DDoS guards. Simple server-side HTML scraping (via Jsoup/HTTP clients) gets blocked with `403 Forbidden` responses without dedicated headless browser automation (Playwright/Puppeteer).
3. **Browser Sandbox & CORS Restrictions:** Web browsers enforce strict Cross-Origin Resource Sharing (CORS), iframe sandboxing, and Referer header policies. Video hosts routinely block playback when embedded on external web origins.

---

## What Works (Reusable Boilerplate)

While full-stream link extraction is not functional, the repository contains solid boilerplate for other projects:

- **Frontend (`/prismplay-ui`):** A responsive React UI replicating Cloudstream's layout, including:
  - Horizontal scrolling category carousels
  - Media detail screens with trailer modals and cast rows
  - Bottom-sheet watch status pickers (_Watching, Completed, Plan to Watch_)
  - Extension repository management views
- **Backend (`/ktor-backend`):** A lightweight Kotlin/Ktor service containerized with Docker, featuring:
  - Persistent volume mapping for JSON state caching
  - Multi-repository manifest parser
  - CORS-enabled REST endpoints for plugins, catalogs, and search routing

---

## Recommended Alternatives

For a reliable, zero-maintenance streaming experience across desktop and mobile, consider using:

- **[Stremio](https://www.stremio.com/)** paired with the **Torrentio** addon and a Debrid service (Real-Debrid / AllDebrid / TorBox) for high-speed, uncompressed 4K VOD streaming.
- **[Cloudstream](https://github.com/recloudstream/cloudstream)** directly on an Android device or Android emulator.
