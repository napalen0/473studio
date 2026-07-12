<div align="center">

# 473studio

### Full‑stack studio that ships production‑ready tools for your business — fast.

A young, fast‑moving developer taking ideas from a blank page to a working, deployed product — architecture, backend, frontend, and infrastructure under one roof.

<br>

[![Live](https://img.shields.io/badge/Live-473studio.ru-2196F3?style=for-the-badge)](https://473studio.ru)
[![License: MIT](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)](LICENSE)

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-363636?style=flat-square&logo=solidity&logoColor=white)

**▶ [Live demo → 473studio.ru](https://473studio.ru)**

</div>

---

## Why work with me

- **Production‑first.** I don't stop at a prototype — I ship things that run in production and handle real users.
- **Speed.** From idea to a deployed, working tool in days, not months.
- **Breadth.** Web apps, Telegram bots, ML/AI, and blockchain — one person, the whole stack.
- **Full ownership.** Architecture → databases → API → frontend → deployment. You get a finished product, not a pile of parts.

---

## Featured work

### RUNA — Cyber‑club network platform
> Configurator & CRM for a network of computer clubs. Interactive builder for gaming zones (PCs, monitors, peripherals) across 8+ locations, a franchise‑request pipeline, and a Telegram feedback bot.

**Stack:** FastAPI · React · Aiogram · PostgreSQL
**Live:** [runavrn.ru](https://runavrn.ru)

### US? — Telegram‑integrated e‑commerce
> Online store wired directly into Telegram: catalog, cart, and orders that flow straight into a bot, with an admin panel for the whole operation.

**Stack:** Next.js · Fastify · PostgreSQL · Telegram Bot API
**Live:** [yesus.in](https://yesus.in)

### SlitherCash — Real‑time multiplayer browser game
> Snake‑arena with server‑authoritative physics (60 Hz tick, 20 Hz broadcast), client‑side prediction with server reconciliation, and entity interpolation — the same netcode patterns used in AAA multiplayer games. Companion Telegram Mini App with tap‑to‑earn mechanics, collectible skins with atomic minting, full admin panel (economy, users, skins, notifications, support tickets), and automated backup system.

**Stack:** Next.js · TypeScript · Socket.IO · Node.js · PostgreSQL · Prisma · Canvas · Telegram Bot API
**Live:** [slithercash.fun](https://slithercash.fun)

### RKN Spotter VPN — Telegram VPN bot
> Self-hosted VPN service managed through a Telegram bot. One-tap access to VLESS + Reality (invisible to DPI), dual transport (TCP + gRPC), split-tunnel routing for Russian sites, multi-server pool with auto-provisioning via SSH, crypto payments via CryptoBot, and a full admin panel.

**Stack:** Python · FastAPI · aiogram 3 · Xray-core · SQLite · asyncssh
**Live:** [@rknspotter_bot](https://t.me/rknspotter_bot)
**Source:** [github.com/napalen0/vpn-bot](https://github.com/napalen0/vpn-bot)

---

## Services

| | |
|---|---|
| **Backend & API** | REST/GraphQL services, auth, integrations, high‑load architecture |
| **Frontend** | Responsive SPAs and landing pages, clean and fast |
| **Telegram bots** | Bots, mini‑apps, and payment/CRM integrations |
| **Databases** | Schema design, optimization, migrations (PostgreSQL, Redis) |
| **ML / AI** | Models, data pipelines, and LLM‑powered features |
| **Blockchain** | Smart contracts, Web3 integrations, on‑chain tooling |

---

## Tech stack

**Backend** — Python (FastAPI, Django), Go, Rust, Node.js (Fastify, Express)
**Frontend** — TypeScript, React, Next.js, vanilla JS/CSS
**Data** — PostgreSQL, Redis, SQLAlchemy, Prisma
**ML / Blockchain** — PyTorch, LLM APIs, Solidity, Web3
**DevOps** — Docker, nginx, Linux, CI/CD, systemd

---

## This repository

The source of the [473studio.ru](https://473studio.ru) landing page — a fast, dependency‑free static site (vanilla HTML/CSS/JS) with a 6‑language i18n layer, live‑typing hero animation, and dark/light theming.

```
473studio/
├── index.html              # markup only
├── assets/
│   ├── css/
│   │   └── styles.css      # all styles, theme variables
│   ├── js/
│   │   ├── translations.js # 6-language i18n data (ru/en/sr/de/fr/es)
│   │   └── main.js         # i18n, typewriter, theme, UI logic
│   └── img/
│       ├── runa-preview.png
│       └── us-preview.png
├── README.md
└── LICENSE
```

## Run locally

It's a static site — no build step, no dependencies.

```bash
# option 1: any static server
python3 -m http.server 8000
# then open http://localhost:8000

# option 2: just open the file
open index.html
```

---

## Contact

**Telegram → [@sadmillionaire](https://t.me/sadmillionaire)**
**Email → [permoscow@icloud.com](mailto:permoscow@icloud.com)**

<div align="center">
<br>
<sub>Built by <b>473studio</b> · <a href="https://473studio.ru">473studio.ru</a></sub>
</div>
