# Preuve de concept — Tchat de support temps réel

Preuve de concept du tchat de support de « Your Car Your Way » : elle valide le module
temps réel séparable de bout en bout (handshake authentifié, échange Customer ↔ Agent,
isolation de conversation).

## Prérequis

- [Node.js](https://nodejs.org/) **≥ 22** (le projet utilise le lanceur de tests intégré
  `node --test` et le chargement natif `--env-file`).
- **`better-sqlite3`** est un module natif : `npm ci` télécharge un **binaire précompilé** pour
  les versions LTS de Node (dont 22) — **ni daemon ni compilation native** requis.

## Installation

```bash
git clone <url-du-dépôt>
cd <dépôt>/poc
npm ci
cp .env.example .env   # puis renseigner POC_TOKEN_SIGNING_KEY (cf. « Variables d'environnement »)
```

## Lancer les tests

La **preuve de viabilité de la PoC, ce sont les tests** (pas l'interface). Les tests d'intégration
prouvent le **handshake authentifié** (token valide → connexion ; absent/invalide → **HTTP 401** à
l'upgrade), l'**échange Customer↔Agent** (message **routé** aux participants de la même conversation
et **persisté**) et l'**isolation de conversation** (un non-participant est **refusé** ; rien n'est
persisté ni livré).

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
développement, `npm run dev` exécute la source via `tsx`, sans build ; `npm run demo` démarre le
serveur en **mode démo** (seed + `--env-file=.env`), détaillé à la section « Lancer le harness ».

## Lancer le harness

Le harness est une **démonstration** (ADR-005), **pas la preuve** : la preuve gradée, ce sont les
**tests** (`npm test`). Procédure de bout en bout :

1. **Construire** : `npm run build`.
2. **Démarrer en mode démo** — seede une conversation + deux participants, puis imprime tout ce qu'il
   faut :

   ```bash
   POC_TOKEN_SIGNING_KEY=<votre-clé> POC_DEMO_SEED=1 node dist/server.js
   # ou, après `cp .env.example .env` (clé renseignée) : npm run demo
   ```

   Le serveur imprime le `conversationId`, **deux tokens** (customer + agent) et **deux URLs harness**
   prêtes à coller. (`POC_PORT` change le port si 8080 est occupé — pensez à l'aligner dans le champ
   « Serveur WebSocket » des pages.)
3. **Ouvrir les deux pages** `poc/harness/customer.html` et `poc/harness/agent.html` dans deux onglets,
   chacune avec son URL imprimée (`...?token=...&conversationId=...`), cliquer **Se connecter**, puis
   échanger : les messages apparaissent **des deux côtés** et sont **persistés**.
4. **Isolation en live (illustration)** : depuis une page connectée, viser un `conversationId` auquel
   le compte **n'appartient pas** et envoyer → le serveur répond **`REFUS : isolation_denied`** (ligne
   rouge), **rien n'est livré ni persisté**. Un `conversationId` **inexistant** suffit pour le voir :
   le serveur traite « conversation absente » et « compte non-membre » **de façon identique** —
   délibéré (anti-énumération, `NFR-SEC-04` : ne pas révéler l'existence des conversations). La
   **preuve forte** — un intrus **authentifié** ciblant une conversation **réelle** dont il n'est pas
   membre — est portée par le test `test/isolation.test.ts` ; la démo ne fait que l'**illustrer**. Un
   **token absent/invalide** échoue, lui, au **handshake** (statut « Refusé au handshake → 401 », la
   connexion n'ouvre pas).

> Sans `POC_DEMO_SEED`, le serveur démarre **nu** (base `:memory:` vierge, aucun seed, aucune
> impression). Le harness ne détient **aucun secret** : la clé de signature reste **côté serveur** ;
> le harness se contente de **consommer** un token déjà signé.

## Variables d'environnement

La PoC ne contient **aucun secret en dur** : la configuration (`src/config.ts`) lit la clé de
signature depuis l'environnement.

| Variable | Rôle |
|---|---|
| `POC_TOKEN_SIGNING_KEY` | Clé **HMAC-SHA256** de signature du **token de test** utilisé au handshake. Propre au **stub du service d'identité** — distincte de la vraie stack d'identité (OIDC / argon2id), spécifiée seulement à l'architecture (ADR-006). |
| `POC_PORT` | Port d'écoute du serveur. **Optionnel** — défaut **8080**, entier 1..65535. |
| `POC_DEMO_SEED` | Mode démo. **Optionnel** — `1` pour seeder une conversation + 2 participants et imprimer tokens + URLs harness au démarrage ; absent ⇒ démarrage nu. |

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
- **Isolation** : portée par la relation **`participant` → `conversation`**, **appliquée au runtime** : un message d'un compte **non-participant** est **refusé** (`Refusal{isolation_denied}`) — rien n'est persisté, rien n'est livré, seul l'émetteur est notifié (motif neutre, anti-énumération). Le primitif est `findParticipant(conversationId, userAccountId)`.
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

## Structure du code

La structure donne à voir la **séparabilité** du module temps réel (la brique extractible, ADR-003) :

```
poc/src/
├── server.ts                     # composition root : câble config + ports, démarre le serveur
├── config.ts                     # seul point qui lit process.env (clé, port, mode démo)
├── demo-seed.ts                  # seed de démo (dev only, hors chemin nominal)
└── realtime/                     # LE module séparable — la couture extractible
    ├── index.ts                  # surface publique (ce qu'une extraction exposerait)
    ├── domain/                   # entités + ports — NE DÉPEND DE RIEN (ni I/O, ni transport)
    │   ├── conversation.ts · participant.ts · message.ts
    │   └── chat-repository.ts    # port de persistance (interface)
    ├── identity/                 # port d'identité + stub + seam de rôle (deriveSeatRole)
    ├── contract/                 # contrat de message (wire) client→serveur / serveur→client
    ├── persistence/              # adapter SQLite — SEUL fichier à importer better-sqlite3
    └── transport/                # serveur WebSocket BRUT (ws) — aucun framework
```

Règle de dépendance : **transport / adapter → domaine**, jamais l'inverse ; le **domaine** ignore le
driver SQLite comme `ws`. L'identité et la persistance sont consommées par **ports** (interfaces
injectées), si bien qu'une extraction du module n'emporterait que `realtime/` + ses ports.
**PostgreSQL** (cible, ADR-019) remplacerait l'adapter SQLite **sans toucher au domaine**.
