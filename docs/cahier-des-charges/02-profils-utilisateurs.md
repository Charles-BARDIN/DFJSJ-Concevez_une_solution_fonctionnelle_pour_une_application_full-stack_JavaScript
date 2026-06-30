## 2. Profils utilisateurs et accessibilité

La section 1 a délimité le périmètre — **application client + API pour applications d'agence
tierces + tchat de support**. Cette section caractérise **qui** utilise le système et **avec
quelles contraintes** — en particulier les **personnes en situation de handicap (PSH)**, traitées
ici comme un **fil directeur** et non comme une annexe (conformément à **ADR-004**).

Ces profils servent de socle aux user stories des sections 3 à 6 : chaque besoin y est rattaché à un
profil, et chaque critère d'accessibilité y renvoie au **référentiel opérationnel** défini en §2.3.

### 2.1 Profils et niveaux d'accès

| Profil | Contexte | Authentifié | Rôle principal |
|---|---|---|---|
| **Visiteur** | Application client | Non · **[HYP]** | Consulter la liste des agences, rechercher des offres, consulter le détail d'une offre. |
| **Client** | Application client | Oui | Gérer son compte et son profil, réserver et payer, suivre / modifier / annuler ses réservations, solliciter le support (tchat). |
| **Agent de support** | Tchat (support) | Oui | Échanger en temps réel avec le client et consulter le contexte de la conversation (§6). |

> **[HYP] ADR-009 — la consultation publique est une hypothèse, pas une donnée du v0.** Le v0 ne dit
> **jamais** que la consultation (agences, recherche, offres, détail) est publique : la rendre
> accessible **sans authentification** (profil **Visiteur**) est une **hypothèse retenue** (usage
> courant du secteur). Le RBAC (distinction client / agent de support) découle d'**ADR-002**.

> **Pas de profil « gestion ».** L'administration (offres, agences, réservations) est assurée par des
> **applications d'agence tierces** — **hors périmètre**, servies par l'API (cf. §5) — et ne donne
> lieu à **aucun profil ni user story** dans notre système. Le **seul usage « personnel »** du
> périmètre est l'**Agent de support**, **participant du tchat** (§6), qui correspond au participant
> **Agent** de la preuve de concept.

Le **Visiteur** peut en outre **initier la création d'un compte** (US-AUTH-01), seule action qui le
fait basculer vers le profil **Client** ; sans authentification, il reste limité à la consultation.

**L'accessibilité concerne tous les usages.** Elle s'applique à l'**application client** comme à
l'**interface de tchat** utilisée par le client et par l'agent de support (qui peut lui aussi être en
situation de handicap) ; les exigences de §2.3 valent pour les deux.

### 2.2 Personas

Personas concrets et **non décoratifs** : chacun porte des objectifs métier (qui alimentent les user
stories) et, pour les PSH, des **technologies d'assistance** et des **besoins d'accessibilité**
rattachés à des étiquettes précises (§2.3). Le **Visiteur** ne fait pas l'objet d'un persona dédié :
il correspond au **parcours pré-authentification du Client** (mêmes personnes, avant connexion).

#### 2.2.1 Application client

**P1 — Sofia, 34 ans — cliente internationale** *(profil de référence, internationalisation)*
- **Contexte** : voyage entre plusieurs pays ; langues et devises différentes ; réserve depuis mobile et ordinateur.
- **Objectifs** : rechercher et comparer des offres, réserver et payer dans sa langue et sa devise, retrouver ses réservations.
- **Obstacles actuels** : applications par pays incohérentes, langues / devises non unifiées.
- **Besoins clés** : interface localisée (langue, **devise**, **fuseau horaire** des dates de prise et de retour), parcours cohérent multi-appareils. → alimente l'**internationalisation** (§7) et les US de recherche / réservation (§4).

**P2 — Camille, 29 ans — déficience visuelle (cécité), lectrice d'écran**
- **Technologies d'assistance** : lecteur d'écran (NVDA / VoiceOver), navigation au clavier.
- **Objectifs** : suivre le même parcours qu'une cliente voyante (rechercher, réserver, payer, gérer).
- **Besoins d'accessibilité** : structure sémantique et points de repère, alternatives textuelles, étiquettes de champs et messages d'erreur annoncés, focus géré, composants correctement nommés (ARIA). → `A11Y-STRUCTURE`, `A11Y-ALTERNATIVES`, `A11Y-FORMULAIRES`, `A11Y-NOM-ROLE`, `A11Y-CLAVIER`.

**P3 — Marc, 45 ans — déficience motrice, navigation au clavier**
- **Technologies d'assistance** : clavier seul ou dispositif de pointage adapté ; pas de pointage fin.
- **Objectifs** : compléter une réservation et un paiement sans souris, sans être pénalisé par le temps.
- **Besoins d'accessibilité** : tout opérable au clavier sans piège, focus visible, ordre de tabulation logique, **délais ajustables** (réservation, paiement), cibles d'interaction confortables. → `A11Y-CLAVIER`, `A11Y-DELAIS`.

**P4 — Léa, 38 ans — déficience auditive (sourde)**
- **Contexte** : exclue des supports téléphoniques ; privilégie l'écrit.
- **Objectifs** : obtenir de l'aide et résoudre un problème de réservation **par un canal texte**.
- **Besoins d'accessibilité** : **support client par tchat texte** (et non par téléphone uniquement) ; aucune information portée par le seul son. → justifie directement le **tchat de support** (§6) comme **canal inclusif** ; `A11Y-ALTERNATIVES`.

**P5 — Karim, 52 ans — trouble cognitif / dyslexie**
- **Objectifs** : réserver sans surcharge cognitive, comprendre les conditions (modification, annulation, remboursement) et corriger ses erreurs.
- **Besoins d'accessibilité** : langage clair, mise en page et navigation cohérentes, prévention et récupération des erreurs (notamment au paiement), pas de délais serrés. → `A11Y-LANGUE`, `A11Y-FORMULAIRES`, `A11Y-DELAIS`.

#### 2.2.2 Personnel — agent de support (participant du tchat)

**P6 — Nadia, 31 ans — agente de support**
- **Objectifs** : prendre en charge plusieurs conversations clients en temps réel, accéder au contexte de réservation, escalader si nécessaire.
- **Besoins** : file de conversations, historique, identité et contexte du client ; **interface elle-même accessible**. → alimente le **tchat côté Agent** (§6).

> **Administration = applications d'agence tierces.** Les opérations de gestion (offres, agences,
> réservations) sont réalisées par des **opérateurs d'applications d'agence tierces** — **hors
> périmètre**, servis par l'API (composants tiers, §5 et dans la proposition d'architecture). Ils ne font pas l'objet d'un
> persona de notre système.

### 2.3 Référentiel d'accessibilité opérationnel

#### 2.3.1 Cadre
Cible : **RGAA** (transposition française des WCAG), conformité visée **WCAG 2.1 niveaux A et AA**.
L'accessibilité s'applique à l'**application client et à l'interface de tchat**, ainsi qu'**aux
livrables eux-mêmes**. Les exigences sont formalisées comme NFR en **§7** ; le présent référentiel
fournit les **étiquettes réutilisables** citées par les critères d'acceptation des user stories
(§3 à §6).

#### 2.3.2 Étiquettes d'accessibilité (réutilisables dans les critères d'acceptation)

| Étiquette | Exigence | Critères WCAG 2.1 (réf.) | Profils servis |
|---|---|---|---|
| `A11Y-STRUCTURE` | Structure sémantique, titres, points de repère, ordre de lecture | 1.3.1 · 2.4.1 · 2.4.6 | P2, P5 |
| `A11Y-CLAVIER` | Opérable au clavier, sans piège, focus visible, ordre logique | 2.1.1 · 2.1.2 · 2.4.3 · 2.4.7 | P2, P3 |
| `A11Y-ALTERNATIVES` | Alternatives textuelles ; information jamais portée par le seul son ou la seule couleur | 1.1.1 · 1.2.1 · 1.4.1 | P2, P4 |
| `A11Y-CONTRASTE` | Contraste suffisant, zoom 200 % / *reflow*, redimensionnement du texte | 1.4.3 · 1.4.4 · 1.4.10 · 1.4.11 | P2, P5 |
| `A11Y-FORMULAIRES` | Étiquettes et instructions, identification et correction des erreurs, prévention (paiement) | 3.3.1 · 3.3.2 · 3.3.3 · 3.3.4 | P2, P3, P5 |
| `A11Y-LANGUE` | Langue déclarée, contenu compréhensible, navigation et identification cohérentes | 3.1.1 · 3.1.2 · 3.2.3 · 3.2.4 | P5 |
| `A11Y-DELAIS` | Délais ajustables, pas d'expiration serrée (réservation, paiement) | 2.2.1 | P3, P5 |
| `A11Y-NOM-ROLE` | Nom, rôle et valeur des composants ; messages de statut annoncés | 4.1.2 · 4.1.3 | P2, P6 |

> **Usage.** Chaque user story des sections 3 à 6 cite les étiquettes pertinentes dans ses critères
> d'acceptation (par exemple un formulaire → `A11Y-FORMULAIRES` + `A11Y-CLAVIER`). C'est ce qui
> garantit l'**accessibilité par user story** (ADR-004) et rend chaque persona PSH **opérationnel**.

#### 2.3.3 Lien avec la suite
- Les exigences transverses d'accessibilité (objectif de conformité, audit, accessibilité des
  livrables) sont formalisées en **§7**.
- La **matrice de traçabilité** (§8) reliera *profils → user stories → étiquettes d'accessibilité*.
