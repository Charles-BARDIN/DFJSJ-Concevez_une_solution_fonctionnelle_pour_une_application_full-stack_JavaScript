# Preuve de concept — Tchat de support temps réel

Preuve de concept du tchat de support de « Your Car Your Way » : elle valide le module
temps réel séparable de bout en bout (handshake authentifié, échange Customer ↔ Agent,
isolation de conversation).

## Prérequis

## Installation

## Lancer les tests

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
