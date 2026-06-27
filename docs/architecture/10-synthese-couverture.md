## 10. Synthèse et couverture

Chapitre de clôture du livrable 2. Il **récapitule** la proposition d'architecture et fournit la **carte
de couverture des indicateurs**. Il ne réargumente rien et n'introduit aucune décision : chaque point
**renvoie** au chapitre et à la décision où il a été traité.

### 10.1 Synthèse de la cible

La proposition tient en quelques piliers, chacun justifié à son chapitre :

- **Architecture** : un **modulithe modulaire** avec un **module temps réel séparable** (couture
  d'extraction), justifié par l'audit (cohérence / maintenabilité, pas la charge) — **ADR-003**,
  chapitre 5.
- **Stack** : **consolidée sur le socle moderne déjà éprouvé** du parc (Node / TypeScript / NestJS /
  React / REST), pas un *greenfield* — **ADR-019**, chapitre 4.
- **Données** : **base relationnelle unifiée** (corrige la fragmentation de l'existant), à **résidence
  régionale** pour le RGPD — **ADR-019 / ADR-020**, chapitres 5 et 6.
- **Autorisation** : **deux plans distincts**, humain (RBAC client / agent) et machine (OAuth2
  client-credentials des applications d'agence) — **ADR-002 / ADR-018**, chapitres 4 et 8.
- **Paiement** : **externalisé et réversible** (collecte hébergée, webhook authentifié, prestataire =
  instance) — **ADR-021**, chapitres 7 et 8.
- **Transverses** : **quatre exigences à part entière**, **accessibilité en tête** (RGAA / WCAG 2.1 AA),
  la sécurité **remédiant nommément** les constats d'audit — **ADR-004**, chapitre 9.

### 10.2 Carte de couverture des indicateurs

Chaque indicateur **C.1.x** est rattaché à son **emplacement de traitement** et à sa **preuve**. Les
indicateurs portés par la **preuve de concept** (Stade 4) sont marqués « **confirmé au Stade 4** » : le
livrable 2 les **prépare**, la PoC les **réalise**.

| Indicateur | Où il est traité | Preuve / artefact |
|---|---|---|
| **C.1.1** — besoins → exigences fonctionnelles | **Livrable 1** (cahier des charges, §1-§8) | User stories + critères d'acceptation ; personas (dont PSH) ; périmètre (ADR-001) |
| **C.1.2** — spécifications techniques cohérentes avec le fonctionnel | **Livrable 2, ch. 3** | Spécifications de cadrage + NFR (dont axe SLO et `NFR-SEC-08`) |
| **C.1.3** — audit (structure, forces / faiblesses / risques) **et** exploitation de l'audit | **ch. 2** (sous-indicateurs 1-2) + **ch. 9 §9.2 / §9.5** (sous-indicateur 3) | Audit `AUD-01`→`AUD-15`, verdict §2.5 ; **table de remédiation** §9.2 — **les trois sous-indicateurs sont couverts** |
| **C.1.4** — choix technologiques comparés + cohérence PoC | **ch. 4** (comparatif par couche, ADR-019) + **§4.10** | Alternatives écartées par couche ; cohérence stack ↔ PoC — **confirmé au Stade 4** (repo PoC) |
| **C.1.5** — modélisation UML + PoC démontre la viabilité | **ch. 5** (composants / déploiement) + **ch. 6** (classes) + **ch. 7** (séquences) | Figures 2-8 + alt-textes ; PoC tchat (handshake / échange / isolation) — **confirmé au Stade 4** |
| **C.1.6** — modèle de données + mise en œuvre dans la PoC | **ch. 6** (modèle + DDL) | Modèle des deux domaines ; substrat `conversation` / `message` / `participant` — **mise en œuvre confirmée au Stade 4** |
| **C.1.7** — intégration des composants tiers + interopérabilité + bonnes pratiques | **ch. 8** (deux tiers, interopérabilité) + **ch. 9** (transverses) | Auth M2M (figure 9), webhook signé ; remédiation sécurité, a11y, écoconception |
| **C.1.8** — environnement de développement + README junior + gestion des secrets | **Stade 4** (repo PoC) | Setup reproductible, README, `.env.example` — **confirmé au Stade 4** |

Aucun indicateur n'est orphelin.

### 10.3 Renvoi au registre des décisions

Les **décisions structurantes** (ADR-000 → ADR-021) — fonctionnelles et techniques — sont tracées dans
le [registre des décisions](../registre-decisions.md), **transverse** au cahier des charges (livrable 1)
et à la présente proposition (livrable 2). Les grands arbitrages :

| Arbitrage | Décision |
|---|---|
| Périmètre (application client + API + tchat ; pas de back-office) | ADR-001 |
| Architecture (modulithe modulaire + module temps réel séparable) | ADR-003 |
| Cibles de niveau de service (SLO) | ADR-017 |
| Authentification machine de l'API agences | ADR-018 |
| Stack technologique | ADR-019 |
| Résidence régionale des données | ADR-020 |
| Prestataire de paiement | ADR-021 |

Le livrable 2 est ainsi complet : l'**audit** diagnostique l'existant, la **proposition** en déduit une
cible **justifiée**, et la **preuve de concept** (Stade 4) en validera la brique temps réel.
