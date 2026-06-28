# Preuve de concept — Tchat de support temps réel

Preuve de concept du tchat de support de « Your Car Your Way » : elle valide le module
temps réel séparable de bout en bout (handshake authentifié, échange Customer ↔ Agent,
isolation de conversation).

## Prérequis

- [Node.js](https://nodejs.org/) **≥ 22** (le projet utilise le lanceur de tests intégré
  `node --test` et le chargement natif `--env-file`).
- **`better-sqlite3`** est un module natif : `npm install` télécharge un **binaire précompilé** pour
  les versions LTS de Node (dont 22) — **ni daemon ni compilation native** requis.

## Installation

```bash
git clone <url-du-dépôt>
cd <dépôt>/poc
npm install
cp .env.example .env   # puis renseigner POC_TOKEN_SIGNING_KEY (cf. « Variables d'environnement »)
```

## Lancer les tests

La **preuve de viabilité de la PoC, ce sont les tests** (pas l'interface). Les tests d'intégration
prouvent le **handshake authentifié** (token valide → connexion ; absent/invalide → **HTTP 401** à
l'upgrade) et l'**échange Customer↔Agent** : un message envoyé est **routé** aux participants de la
même conversation et **persisté**.

```bash
npm test
```

`npm run typecheck` vérifie les types sans rien émettre.

## Lancer le serveur

```bash
npm run build
node --env-file=.env dist/server.js
```

Le serveur écoute sur le port **`POC_PORT`** (défaut **8080**). **Si le port est déjà utilisé**, il
l'indique clairement et s'arrête proprement — définir `POC_PORT` sur un port libre. Le raccourci
`npm start` lance `node dist/server.js` (la clé doit déjà être présente dans l'environnement) ; en
développement, `npm run dev` exécute la source via `tsx`, sans build.

## Lancer le harness

## Variables d'environnement

La PoC ne contient **aucun secret en dur** : la configuration (`src/config.ts`) lit la clé de
signature depuis l'environnement.

| Variable | Rôle |
|---|---|
| `POC_TOKEN_SIGNING_KEY` | Clé **HMAC-SHA256** de signature du **token de test** utilisé au handshake. Propre au **stub du service d'identité** — distincte de la vraie stack d'identité (OIDC / argon2id), spécifiée seulement à l'architecture (ADR-006). |
| `POC_PORT` | Port d'écoute du serveur. **Optionnel** — défaut **8080**, entier 1..65535. |

Le modèle est fourni dans `.env.example`. Sur un poste de développement :

```bash
cp .env.example .env
# puis éditer .env et remplacer la valeur de POC_TOKEN_SIGNING_KEY
```

La configuration **échoue immédiatement (fail-fast)** si la clé est absente ou vide. Le fichier
`.env` n'est **jamais versionné** (couvert par `.gitignore`).

## Modèle de données

La PoC persiste le **substrat tchat** du modèle ch.06 dans trois tables relationnelles
(`src/realtime/persistence/schema.sql`) :

| Table | Colonnes | Contraintes / relations |
|---|---|---|
| `conversation` | `id`, `status`, `created_at` | — |
| `participant` | `id`, `conversation_id`, `user_account_id`, `role` | `conversation_id` → `conversation(id)` ; **`UNIQUE (conversation_id, user_account_id)`** ; `role` ∈ {`customer`, `agent`} |
| `message` | `id`, `conversation_id`, `sender_participant_id`, `body`, `sent_at` | `conversation_id` → `conversation(id)` ; `sender_participant_id` → `participant(id)` |

- **Un compte = un siège par conversation** : la contrainte **`UNIQUE (conversation_id, user_account_id)`** interdit qu'un même compte siège deux fois dans une conversation (tentative rejetée par un **résultat typé**, pas une exception brute).
- **Isolation** : portée par la relation **`participant` → `conversation`**. Le primitif `findParticipant(conversationId, userAccountId)` répond à « ce compte est-il participant de cette conversation ? » ; l'enforcement runtime s'y branchera.
- **Intégrité référentielle appliquée** : `PRAGMA foreign_keys = ON` (posé par l'adapter) — un message ne peut référencer ni une conversation ni un participant inexistants.
- **`user_account_id`** est une **référence opaque** (`TEXT`) vers l'identité **stubée** : la PoC ne persiste pas de table `user_account`, donc aucune clé étrangère vers elle (ch.06 la pose en `BIGINT` FK ; ici l'identité est une chaîne opaque issue du stub).

### Port / adapter — SQLite ici, PostgreSQL en cible

L'**engagement d'architecture est le paradigme relationnel** (intégrité référentielle + ACID, §4.7) ;
le **moteur** est un **détail d'adapter** derrière le port `ChatRepository` (domaine agnostique). La
cible reste **PostgreSQL** (ADR-019) ; **SQLite** (`better-sqlite3`) est le **substrat de preuve**
(pas de daemon en démo, binaire précompilé). La **structure** des trois tables est **fidèle au DDL
ch.06** du livrable 2 (tables, colonnes, clés étrangères, `UNIQUE`, `CHECK` de rôle) ; **seule
l'affinité de type** diffère, ce qui est un détail de substrat :

| Concept | Cible PostgreSQL (ch.06) | Substrat SQLite (PoC) |
|---|---|---|
| Identifiants générés | `BIGINT` | `INTEGER` (rowid) |
| Horodatages | `TIMESTAMPTZ` | `TEXT` ISO-8601 UTC |
| Énumération de rôle | `TEXT` + `CHECK IN (…)` | `TEXT` + `CHECK IN (…)` |
