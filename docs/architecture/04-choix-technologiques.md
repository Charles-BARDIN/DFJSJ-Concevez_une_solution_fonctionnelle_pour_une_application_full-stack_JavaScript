## 4. Choix technologiques et alternatives

Ce chapitre **sélectionne et justifie** la pile technologique de la cible, **couche par couche**, en
**comparant** chaque choix à ses alternatives. Le comparatif explicite **est** l'objet du chapitre : il
est déroulé, non résumé. La décision consolidée est enregistrée en **ADR-019** (registre des
décisions) ; ce chapitre en porte le **raisonnement**.

### 4.1 Thèse directrice — consolider, ne pas proliférer

Le choix de stack **découle de l'audit**, jamais d'une préférence. L'existant **contient déjà sa
propre référence** : l'application **US** (React / Node.js, conteneurisée) porte les **meilleures
métriques** runtime et ops du parc — charge 350 req/s (`AUD-04`), erreurs en pic 0,8 % (`AUD-05`),
déploiement 91 % et stabilisation 1,7 j (`AUD-07`), MTTR ~1 h 10 (`AUD-08`), indisponibilité 7 min/mois
(`AUD-14`) — et l'application **CA** prouve déjà la bonne pratique sécurité avec **argon2id**
(`AUD-10`).

La cible **consolide sur ce socle moderne déjà éprouvé dans le parc** et adopte la **meilleure pratique
sécurité existante**. C'est l'inverse d'un *greenfield* : introduire une pile **absente du parc** (autre
langage, autre runtime) **reproduirait** le grief de **prolifération** (`AUD-01`) qu'on reproche
précisément à l'existant — barre très haute, qu'aucune couche ne franchit. Deux principes guident donc
chaque sous-section :

1. **consolider** sur le **socle prouvé** (US) et sur la **compétence existante la plus large** ;
2. distinguer ce que la **modernisation** corrige (dette du socle historique) de ce qui relèverait du
   **runtime** : les fautes du cœur historique se corrigent **indépendamment** du choix de pile.

### 4.2 Runtime — Node.js

**Choix : Node.js.** C'est le runtime du **meilleur élément du parc** (app US) **et** le **plus
répandu** : on le trouve à la fois dans le **cœur historique** FR/DE/ES/IT et dans l'application US.
Consolider dessus **leverage la plus large compétence déjà présente** — l'audit relève en **contrainte**
des « équipes habituées à des piles hétérogènes » (§2.5.2) ; unifier sur le runtime le plus diffusé
**réduit** le coût de cette contrainte plutôt que de l'aggraver.

**Désamorçage — « Node, c'est aussi le cœur FR, le pire du parc ».** Node **couvre le meilleur (US) et
le pire (FR)** : ce n'est donc **pas** un argument « Node = bon ». Les fautes du cœur FR/DE/ES/IT — **SHA-1**
(`AUD-10`), **TLS 1.0** (`AUD-11`), **déploiement manuel** (`AUD-07`), **absence de typage** et dette —
sont des **défauts de pratique et de modernisation**, **pas** du runtime ; toutes sont **corrigées par
la cible indépendamment du runtime**. L'application US **démontre** dans le parc même qu'un **Node
moderne** (conteneurisé, typé, déployé en continu) porte les **meilleures métriques**. Le choix de Node
n'efface pas la dette FR : il s'appuie sur la **preuve US** que la dette tient à la pratique, non à Node.

| Alternative | Évaluation | Verdict |
|---|---|---|
| **PHP / Laravel** (UK) | Pile présente, métriques intermédiaires | Écartée : ré-éparpillerait sur une pile distincte du socle prouvé |
| **Java / Spring** (CA) | Pile présente, bonne UX mais métriques runtime moindres que US | Écartée : même raison ; n'est pas le meilleur élément du parc |
| **Runtime absent du parc** (Go, etc.) | Aucun ancrage dans l'existant | Écartée : **prolifération** (`AUD-01`), barre injustifiée par l'audit |

### 4.3 Langage — TypeScript (front et back)

**Choix : TypeScript**, sur tout le périmètre. Le typage statique est retenu comme **durcissement du
socle Node**, **pas** comme « langage moderne » : il introduit des **contrats explicites** qui **réduisent
la divergence** du code — précisément le grief `AUD-01` (hétérogénéité) et `AUD-02` (duplication /
divergence des déclinaisons FR copiées-adaptées). Un **seul langage typé full-stack** (même langage
côté React et côté Node) **réduit la surface de divergence** entre front et back.

| Alternative | Évaluation | Verdict |
|---|---|---|
| **JavaScript nu** | Cohérent avec Node / US, sobriété maximale | Écartée : **n'outille pas** contre la divergence (`AUD-01/02`) que la cible doit corriger |

### 4.4 Framework backend — NestJS

**Choix : NestJS.** Justifié — **au même grain que PostgreSQL** — par son **adéquation au modulithe**,
non par familiarité. Le **système de modules** de Nest est une **traduction directe** du **modulithe
modulaire** (ADR-003) : frontières explicites, dépendances déclarées. Le **module temps réel séparable**
y devient un **module de première classe** doté d'une couture nette (sert C.1.2 et C.1.5).
L'**injection de dépendances** et le **TypeScript natif** rendent les **contrats explicites**, dans le
prolongement de la thèse TS (`AUD-01/02`). L'audit ne mesure **aucun framework** — il n'y a donc **pas
d'`AUD-NN` forcé** ici, comme pour REST (§4.6).

**Préemption — « Nest supporte les microservices, n'êtes-vous pas censé être contre ? ».** Nest est un
framework de **modulithe** qui **supporte aussi** des transports microservices ; on en utilise le
**système de modules** pour tenir un **modulithe propre**, **pas** ses transports microservices. C'est
exactement la logique du **module séparable** : **couture, pas éclatement**. Le transport temps réel
reste **`ws` brut** (§4.8), et **Nest n'est pas utilisé dans la PoC**.

| Alternative | Évaluation | Verdict |
|---|---|---|
| **Express nu** (Node) | Minimal, sans opinion | Écartée : **pas de structure modulaire de première classe** ; le modulithe devrait être recréé à la main |
| **Framework d'un autre runtime** (Spring, Laravel…) | Structuré, mais hors socle retenu | Écartée : **prolifération** (`AUD-01`) |

### 4.5 Frontend — React

**Choix : React.** C'est le front de l'application US **éprouvée** dans le parc, et il aligne
l'interface sur **un seul écosystème JS/TS** avec le back (Node / TypeScript / Nest), ce qui **réduit la
divergence** (`AUD-01`). La justification est **l'écosystème**, **pas le débit** : les **350 req/s**
(`AUD-04`) sont une métrique **backend** et ne s'attribuent **pas** à React.

| Alternative | Évaluation | Verdict |
|---|---|---|
| **Angular** (CA) | Pile présente, bonne UX | Écartée : écosystème **distinct** du socle retenu |
| **EJS** (FR) | Rendu serveur historique | Écartée : **legacy**, c'est l'existant à remplacer |

### 4.6 Style d'API — REST sur HTTPS

**Choix : REST.** Le chapitre 3 posait « API CRUD REST par domaine » comme **donnée d'entrée** (ADR-001)
sans le **justifier** ; la justification se fait **ici**. L'API est une **API CRUD par domaine**
consommée par des **applications d'agence tierces hétérogènes** (C.1.7) : c'est la **friction
d'intégration** qui prime. REST offre l'**interopérabilité maximale** et un **outillage ubiquitaire**.
L'ancrage est le **besoin** (C.1.7 + ADR-001), sans `AUD-NN` forcé.

| Alternative | Évaluation | Verdict |
|---|---|---|
| **GraphQL** | Évite le sur-/sous-*fetch* d'un **client riche** unique | Écartée : ne répond pas au **CRUD inter-organisations** ; complexifie l'intégration tierce |
| **gRPC** | Performant en interne (contrats binaires) | Écartée : **hostile** aux intégrateurs tiers hétérogènes et aux navigateurs |

### 4.7 Base de données — relationnel (PostgreSQL)

**Choix : base relationnelle, PostgreSQL.** Deux justifications **distinctes**, à ne pas confondre :

1. **Unifier** une base unique (vs la **fragmentation** `AUD-03` : une base par pays, schémas
   divergents) — ce besoin est **agnostique au moteur** ; l'audit ne nomme **aucun SGBD** existant.
2. **Choisir le relationnel** relève du **domaine**, pas de la consolidation de parc : **intégrité
   référentielle** Ville–Agence–Offre (ADR-012), **transactions ACID** pour la **machine à états** de
   réservation (ADR-011 / ADR-014), **séparation données personnelles / transactionnelles** exigée par
   le RGPD (ADR-010).

PostgreSQL est un choix **raisonnable et nommable**, mais l'essentiel défendable est **relationnel vs
non-relationnel** — et **non** « Postgres parce qu'il serait déjà dans le parc » (il n'y est pas désigné).

| Alternative | Évaluation | Verdict |
|---|---|---|
| **NoSQL document** | Souplesse de schéma, mise à l'échelle horizontale | Écartée : **relâche** l'intégrité référentielle et les **garanties transactionnelles** dont le domaine dépend ; souplesse non requise ici |

### 4.8 Temps réel — WebSocket via `ws` in-process

**Choix : WebSocket** (déjà décidé, ADR-003), porté par la **bibliothèque `ws` du runtime Node**, **dans
le même runtime** que le modulithe. La passerelle temps réel est un **module *in-process*** : la
séparabilité est une **frontière de module**, pas une techno ni un nœud distinct.

**Pas de broker.** La volumétrie ne révèle **aucun problème de charge** (`AUD-04`, 150–350 req/s) :
introduire un **broker externe** (Redis, Kafka) pour le tchat serait de la **sur-ingénierie**. Le tchat
reste **in-process** dans le modulithe (module séparable).

| Alternative | Évaluation | Verdict |
|---|---|---|
| **Broker externe** (Redis / Kafka) | Découplage et *fan-out* à grande échelle | Écartée : **sur-ingénierie** — aucune charge à absorber (`AUD-04`) |
| **socket.io** | Abstraction WebSocket + *fallbacks* | Écartée : couche superflue ; **`ws` brut** colle au harness PoC (ADR-005) |

### 4.9 Identité et autorisation — OAuth2 / OIDC + argon2id

**Choix : un serveur d'autorisation standard servant les deux flux**, avec **hachage argon2id**
(`NFR-SEC-01`, pratique déjà éprouvée en CA, `AUD-10`). La précision des protocoles :

- **flux humain** (client, agent de support) : **OIDC** — émission d'un **ID token** identifiant
  l'utilisateur, au-dessus d'OAuth2 ;
- **flux machine** (applications d'agence) : **client-credentials**, qui est de l'**OAuth2 pur** —
  **pas d'utilisateur, pas d'ID token** (ADR-018).

Autrement dit, le serveur sert **OAuth2 pour les deux flux**, et **OIDC se superpose au seul flux
humain**. Les deux plans d'autorisation restent **distincts** (ADR-002 / ADR-018).

**Spécifié, mais stubé dans la PoC.** Le serveur d'autorisation est **spécifié au niveau architecture**
mais **délibérément non instancié en produit lourd** : la PoC **stube** la stack d'identité (ADR-006)
via un helper de vérification de token. Imposer un IdP déployé obligerait la PoC à le **contourner
maladroitement**.

| Alternative | Évaluation | Verdict |
|---|---|---|
| **IdP lourd déployé** (p. ex. serveur dédié auto-hébergé) | Complet, mais lourd au stade PoC | Écartée : la PoC devrait le **stuber / contourner** (ADR-006) ; on reste au **principe + standard** |
| **Clés d'API** pour le flux machine | Trivial | Écartée en ADR-018 : secret statique sans rotation → reproduirait `AUD-12` |

### 4.10 Cohérence stack ↔ PoC

La cohérence entre la stack annoncée et la PoC du Stade 4 est une **exigence explicite de C.1.4**. La
PoC implémente un **sous-ensemble fidèle** de la cible :

- **serveur WebSocket Node / `ws` brut** — **pas de Nest dans la PoC** (le transport temps réel est
  identique sous tout framework ; Nest héberge les **modules REST** que la PoC **stube / omet**) ;
- **stockage relationnel** pour `conversation` / `message` / `participant`, **structure documentée dans
  le README** (C.1.6 exige sa mise en œuvre dans la PoC) ;
- **helper de vérification de token stubé** (ADR-006) ;
- **hygiène des secrets de base** : **clé de signature du token en variable d'environnement**,
  **`.env.example`** documenté (C.1.8) — le *système* de secrets (vault / rotation) reste, lui,
  spécifié à l'architecture.

La **structure du code** de la PoC **donne à voir la séparabilité** du module temps réel ; ce que la PoC
code est un **sous-ensemble** de la cible, dans le **même runtime** et le **même type de stockage** —
aucune divergence.

### 4.11 Synthèse

| Couche | Choix | Ancrage principal |
|---|---|---|
| Runtime | **Node.js** | `AUD-04/05/07/08/14` ; compétence la plus large (§2.5.2) |
| Langage | **TypeScript** (front + back) | durcissement vs divergence (`AUD-01/02`) |
| Framework backend | **NestJS** | modules = modulithe (ADR-003) ; contrats explicites |
| Frontend | **React** | front US éprouvé ; écosystème unique (`AUD-01`) |
| API | **REST / HTTPS** | tiers hétérogènes (C.1.7) + CRUD par domaine (ADR-001) |
| Base | **Relationnel / PostgreSQL** | unifier (`AUD-03`) + domaine (ADR-010/011/012/014) |
| Temps réel | **WebSocket `ws` in-process** | ADR-003 ; pas de charge (`AUD-04`) |
| Identité | **OAuth2 / OIDC + argon2id** | ADR-002 / ADR-018 ; `AUD-10` |

**Anti-sur-ingénierie.** La pile reste **sobre** : **mono-runtime** (un seul écosystème JS/TS),
**modulithe**, **pas de broker**, **pas d'IdP lourd**, **pas de Nest dans la PoC**. La décision
consolidée est enregistrée en **ADR-019** ; le **prestataire de paiement** est tranché séparément au
**Checkpoint B**, avant les vues dynamiques (chapitre 7).
