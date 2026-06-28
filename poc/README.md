# Preuve de concept — Tchat de support temps réel

Preuve de concept du tchat de support de « Your Car Your Way » : elle valide le module
temps réel séparable de bout en bout (handshake authentifié, échange Customer ↔ Agent,
isolation de conversation).

## Prérequis

- [Node.js](https://nodejs.org/) **≥ 22** (le projet utilise le lanceur de tests intégré
  `node --test` et le chargement natif `--env-file`).

## Installation

```bash
git clone <url-du-dépôt>
cd <dépôt>/poc
npm install
cp .env.example .env   # puis renseigner POC_TOKEN_SIGNING_KEY (cf. « Variables d'environnement »)
```

## Lancer les tests

La **preuve de viabilité de la PoC, ce sont les tests** (pas l'interface). Les tests d'intégration
prouvent le **handshake authentifié** : un token valide ouvre la connexion ; un token absent ou
invalide est rejeté par un **HTTP 401** à l'upgrade.

```bash
npm test
```

`npm run typecheck` vérifie les types sans rien émettre.

## Lancer le serveur

```bash
npm run build
node --env-file=.env dist/server.js
```

Le serveur écoute le handshake authentifié sur le port **8080**. Le raccourci `npm start` lance
`node dist/server.js` (la clé doit alors déjà être présente dans l'environnement) ; en
développement, `npm run dev` exécute la source via `tsx`, sans build.

## Lancer le harness

## Variables d'environnement

La PoC ne contient **aucun secret en dur** : la configuration (`src/config.ts`) lit la clé de
signature depuis l'environnement.

| Variable | Rôle |
|---|---|
| `POC_TOKEN_SIGNING_KEY` | Clé **HMAC-SHA256** de signature du **token de test** utilisé au handshake. Propre au **stub du service d'identité** — distincte de la vraie stack d'identité (OIDC / argon2id), spécifiée seulement à l'architecture (ADR-006). |

Le modèle est fourni dans `.env.example`. Sur un poste de développement :

```bash
cp .env.example .env
# puis éditer .env et remplacer la valeur de POC_TOKEN_SIGNING_KEY
```

La configuration **échoue immédiatement (fail-fast)** si la clé est absente ou vide. Le fichier
`.env` n'est **jamais versionné** (couvert par `.gitignore`).
