# PrismPlay ⚡

PrismPlay is a modular web-based media streaming aggregator designed with a cloud-native architecture. It features a React frontend and a Kotlin Ktor backend running inside Docker, capable of parsing Cloudstream-compatible community extension repositories.

## Architecture

- **Frontend:** React, Vite, Tailwind CSS (Cloudstream-inspired UI layout)
- **Backend:** Kotlin, Ktor, Gson, Jsoup (JVM containerized execution)
- **Storage:** Persistent volume mapping for extension repositories and manifest caching

## Quick Start Guide

1. **Build and Run Backend (Docker):**
   ```bash
   cd ktor-backend
   docker build -t prismplay-jvm .
   docker run --rm -p 8080:8080 -v "$(pwd)/data:/app/data" prismplay-jvm
   ```
2. **Run Frontend (React)**
   ```bash
   cd prismplay-ui
   npm install
   npm run dev
   ```
3. **Access the Application:**
   Open [http://localhost:5173](http://localhost:5173) in your browser.
