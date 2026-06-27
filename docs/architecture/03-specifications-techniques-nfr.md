## 3. Spécifications techniques et exigences non fonctionnelles

### 3.1 Objet et niveau de cadrage

Ce chapitre pose les **spécifications techniques de cadrage** de l'architecture cible et ses
**exigences non fonctionnelles (NFR)**. Il énonce le **quoi mesurable** et les **principes** ; il ne
descend **pas** au niveau de la configuration (valeurs de *timeout*, tailles de pool, détails
d'infrastructure), qui n'est pas du ressort du cadrage.

**Frontière avec le chapitre 4.** Ce chapitre reste **agnostique en technologie** : il ne choisit ni
langage, ni *framework*, ni base de données concrète — c'est l'objet du **chapitre 4** (choix
technologiques et alternatives). Il s'appuie en revanche sur les **décisions déjà actées** au registre,
qu'il pose comme **données d'entrée** : style **modulithe modulaire** avec **module temps réel
séparable** (**ADR-003**), **API CRUD par domaine** (**ADR-001** ; style **REST** arrêté au ch. 4 /
**ADR-019**), **deux plans
d'authentification** humain / machine (**ADR-002** / **ADR-018**), **base de données unifiée**
(**ADR-003**, **ADR-012**).

**Non-duplication avec le cahier des charges (livrable 1, §7).** Le cahier des charges définit **déjà**
un catalogue de NFR transverses — accessibilité (`NFR-A11Y-01..04`), internationalisation
(`NFR-I18N-01..04`), sécurité (`NFR-SEC-01..07`), RGPD (`NFR-RGPD-01..07`), écoconception
(`NFR-ECO-01..05`). Ce chapitre **ne les ré-énumère pas** (un second catalogue divergent reproduirait
le défaut `AUD-03` reproché à l'existant). Il procède en trois temps :

1. il pose les **spécifications techniques de cadrage** de la cible (§3.2) ;
2. il **traduit** les NFR existants du §7 en **implications d'architecture** qui les réalisent (§3.3),
   sans les recopier ;
3. il **ajoute** les seuls **NFR nouveaux** (§3.4 fiabilité / disponibilité, §3.5 authentification
   machine), en **continuant la numérotation** du §7.

La traçabilité **spécification / NFR → moteur** (ADR, constat d'audit `AUD-NN`) est récapitulée en
§3.6.

### 3.2 Spécifications techniques de cadrage (agnostiques en technologie)

Le tableau ci-dessous fixe les **principes structurants** de la cible, chacun rattaché à sa décision.
Ils contraignent les choix du chapitre 4 **sans les anticiper**.

| Spécification | Principe cible (cadrage) | Ancrage |
|---|---|---|
| **Style applicatif** | **Modulithe modulaire** : modules métier délimités, **une seule unité de déploiement**. Le **tchat / temps réel** est un **module séparable** doté d'une **couture d'extraction** (frontière de module, pas nœud déjà séparé). | ADR-003 |
| **Exposition de service** | **API CRUD par domaine** (utilisateur, réservation, offre, agence…), **unifiée**, consommée par l'application client et par les **applications d'agence tierces**. *(Le style **REST** est arrêté au ch. 4 / **ADR-019**.)* | ADR-001 |
| **Données** | **Base unifiée** (source de vérité commune), modèle Ville–Agence–Offre et séparation données personnelles / transactionnelles posés au chapitre 6. | ADR-003 ; ADR-012 |
| **Transport chiffré** | **TLS 1.2+** sur **tous** les échanges ; **terminaison TLS en bordure de plateforme** (passerelle d'entrée) ; **REST sur HTTPS** pour l'API, **WebSocket sécurisé (wss)** pour le tchat via la **passerelle temps réel** (module séparable). | `NFR-SEC-02` ; ADR-003 |
| **Deux plans d'autorisation** | **Humain** — **token utilisateur** (déjà *token-based*, ADR-006), **RBAC client / agent de support**. **Machine** — **OAuth2 client-credentials** pour les applications d'agence, **scopes par domaine**. Les deux plans sont **distincts** et ne se confondent pas. | ADR-002 ; ADR-018 |
| **Attentes runtime** | **Redondance** des instances applicatives (sert la disponibilité) et **mise à l'échelle horizontale** (sert la capacité agrégée), **découlant des SLO** (§3.4) — **sans choisir l'infrastructure concrète**. | ADR-017 ; ADR-003 |

> Ces principes sont **délibérément sobres** : ils répondent au diagnostic de l'audit (cohérence,
> maintenabilité, sécurité, fiabilité) sans sur-dimensionner. Toute spécification plus fine
> (configuration, dimensionnement) relève de l'implémentation, non du cadrage.

### 3.3 NFR existants (livrable 1, §7) — traduction en spécifications techniques

Pour chaque axe, le tableau donne l'**implication d'architecture** qui **réalise** les NFR déjà posés
au §7 du cahier des charges. Il s'agit d'une **traduction en spécifications**, pas d'une recopie : les
identifiants restent ceux du §7, qui demeure leur catalogue de référence.

| Axe (renvoi §7, livrable 1) | Implication d'architecture / spécification technique qui le réalise |
|---|---|
| **Accessibilité** (`NFR-A11Y-01..04`) | Conformité **RGAA / WCAG 2.1 AA** visée sur l'**application client** et l'**interface de tchat** ; **point de contrôle d'accessibilité en intégration continue** (revue par critères RGAA + tests automatisables) avant mise en production, réalisant `NFR-A11Y-04`. |
| **Internationalisation** (`NFR-I18N-01..04`) | **Externalisation des libellés** (catalogues de traduction) pour interface et e-mails ; **devise** portée au niveau présentation et paiement ; **horodatages stockés en référence neutre (UTC)** et **convertis au fuseau** à l'affichage ; **formats locaux** (dates, nombres) côté présentation. |
| **Sécurité** (`NFR-SEC-01..07`) | **Hachage argon2id** des mots de passe ; **terminaison TLS 1.2+ et wss** (cf. §3.2) ; **gestionnaire de secrets centralisé** ; **SCA en intégration continue** ; **journalisation des actions sensibles** (`NFR-SEC-06`) ; **messages neutres** anti-énumération ; **paiement externalisé** (PCI-DSS délégué, `NFR-SEC-05`, détaillé aux chapitres 7-8). Ces spécifications **réalisent les remédiations déjà posées au §7.3** (argon2id ← `AUD-10`, TLS 1.2+/wss ← `AUD-11`, gestionnaire de secrets ← `AUD-12`, SCA en CI ← `AUD-13`) ; elles ne sont **pas ré-inventées ici**. |
| **RGPD** (`NFR-RGPD-01..07`) | **Séparation données personnelles / transactionnelles** dans le modèle (chapitre 6) pour servir l'**effacement / anonymisation** (`NFR-RGPD-02`) ; **export self-service** en format structuré (`NFR-RGPD-07`) ; **traçabilité des accès** aux données personnelles (journalisation, recoupe `NFR-SEC-06` / `NFR-RGPD-06`) ; **transferts UE ↔ Amérique du Nord** encadrés — **implication de déploiement par région** (chapitre 5), **sans choisir l'hébergeur**. |
| **Écoconception** (`NFR-ECO-01..05`) | **Payloads minimaux + pagination** sur l'API (pas de sur-*fetch*) ; **transport événementiel WebSocket** pour le tchat (**pas de scrutation HTTP**) et **fermeture des connexions inactives** ; **mise en cache** HTTP / référentiels ; **budget de performance** (poids de page, nombre de requêtes) **défini et mesuré en CI**. |

### 3.4 NFR nouveaux — Fiabilité et disponibilité (axe SLO)

Le §7.3 du cahier des charges **renvoyait explicitement** les cibles de fiabilité / disponibilité à la
proposition d'architecture. Elles sont posées **ici**, en **opérationnalisant ADR-017** : l'ADR porte
la **décision et sa justification** ; le NFR ajoute la **cible mesurable et son mode de vérification**.
Le §7 ne comportait pas d'axe fiabilité / disponibilité ; un **nouvel axe `NFR-SLO`** est donc créé,
sans collision avec les axes existants.

| NFR | Cible mesurable | Mesure / vérification | Ancrage |
|---|---|---|---|
| `NFR-SLO-01` | **Disponibilité ≥ 99,9 %/an** (**base annuelle**, **plancher délibéré**) | Taux de disponibilité calculé sur **fenêtre glissante de 12 mois** | ADR-017 ; `AUD-08` ; note §2.1 |
| `NFR-SLO-02` | **MTTR ≤ 1 h** | Temps médian de rétablissement par incident (journal d'incidents) | ADR-017 ; `AUD-08` |
| `NFR-SLO-03` | **Réussite de déploiement ≥ 95 %** | Ratio déploiements réussis / total dans la chaîne CI/CD | ADR-017 ; `AUD-07` |
| `NFR-SLO-04` | **Stabilisation post-release ≤ 1 j** | Délai entre une mise en production et le **retour au régime nominal** d'erreurs | ADR-017 ; `AUD-07` |
| `NFR-SLO-05` | **Taux d'erreur en pic ≤ 1 %** | Ratio réponses en erreur / total **en fenêtre de pic** | ADR-017 ; `AUD-05` |
| `NFR-SLO-06` | **Capacité ≥ 350 req/s en plancher** + **mise à l'échelle horizontale** | Charge soutenue sans dégradation, **vérifiée par test de charge** avant mise en production | ADR-017 ; `AUD-04` |
| `NFR-SLO-07` | **Latence — sans cible chiffrée, à instrumenter** | **p95 à mesurer** une fois la plateforme en place ; **aucune cible posée** | ADR-017 (réserve) |

> **Lecture de `NFR-SLO-01` (disponibilité).** La cible est un **plancher délibéré en base annuelle**
> (convention SLA). Ce n'est **pas** une amélioration générale de la disponibilité : **rapportée au
> temps d'indisponibilité mensuel** (`AUD-14`, de l'ordre de 99,99 %), elle reste **en deçà**. Pris au
> pied de la lettre, le mensuel imposerait du **4-nines** que la **volumétrie** (`AUD-04`, 150–350
> req/s) ne justifie pas ; **ancrer l'annuel** avec un plancher sobre est le seul choix cohérent avec
> l'**anti-sur-ingénierie** (**ADR-003**). La **divergence annuel / mensuel** est signalée en **note
> §2.1** de l'audit ; elle n'est **pas réconciliable** à partir de la source.

> **Lecture de `NFR-SLO-06` (capacité).** Unifier les applications régionales revient à porter la
> **somme** des charges sur une plateforme, non le **maximum** d'une seule (350 req/s = plafond d'**une**
> application, l'US, `AUD-04`). La cible pose donc **350 req/s en plancher** et **passe à l'échelle
> horizontalement** (élasticité) plutôt qu'en boîte fixe plus grosse : elle répond à l'**agrégation
> sans sur-dimensionner**.

### 3.5 NFR nouveau — Sécurité : authentification machine-to-machine de l'API agences (`NFR-SEC-08`)

Le §7.3 s'arrête à `NFR-SEC-07` ; ce nouveau besoin **continue la série SEC** et **opérationnalise
ADR-018**.

| NFR | Exigence | Mesure / vérification | Ancrage |
|---|---|---|---|
| `NFR-SEC-08` | **Authentification machine-to-machine** de l'API exposée aux applications d'agence : **OAuth2 client-credentials**, **scopes par domaine** (RBAC **machine**), **tokens courts + secret rotable**, **journalisation par `client_id`** (renvoie à `NFR-SEC-06`). **Distincte du RBAC humain** (`NFR-SEC-01` / ADR-002) : deux plans d'autorisation séparés. | Tests d'intégration de l'API : **handshake client-credentials accepté**, **scope hors domaine refusé**, **token expiré / absent rejeté** | ADR-018 ; `AUD-12` |

### 3.6 Traçabilité (NFR / spécification → moteur)

Chaque NFR nouveau et chaque spécification renvoie au **constat d'audit** et à la **décision** qui le
motivent — la chaîne **constat → remédiation** (§1.3) est ainsi préservée.

| Élément | Décision (ADR) | Constat d'audit | Lien NFR |
|---|---|---|---|
| `NFR-SLO-01..07` (fiabilité / disponibilité / capacité) | ADR-017 | `AUD-07`, `AUD-08`, `AUD-09`, `AUD-15` (fiabilité-dispo) ; `AUD-04`, `AUD-05` (capacité-erreur) | nouvel axe `NFR-SLO` |
| `NFR-SEC-08` (auth machine de l'API) | ADR-018 | `AUD-12` | recoupe `NFR-SEC-06` ; distinct de `NFR-SEC-01` |
| Spéc. de remédiation sécurité (argon2id, TLS 1.2+/wss, gestionnaire de secrets, SCA) | — (posées au §7.3, livrable 1) | `AUD-10`, `AUD-11`, `AUD-12`, `AUD-13` | `NFR-SEC-01/02/03/07` |
| Style modulithe + couture temps réel ; base unifiée ; API unifiée | ADR-003 ; ADR-001 ; ADR-012 | `AUD-01`, `AUD-02`, `AUD-03`, `AUD-06` | — |

> **Frontière rappelée.** Ce chapitre **mesure** et **principe** ; il ne **choisit pas** la
> technologie. La sélection et la justification de la stack — réalisant ces spécifications et ces NFR —
> font l'objet du **chapitre 4**.
