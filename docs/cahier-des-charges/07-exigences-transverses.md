## 7. Exigences transverses (non fonctionnelles)

Les exigences ci-dessous s'appliquent à **l'ensemble du système** et **à toutes les user stories**
(§3 à §6). Conformément à **ADR-004**, elles sont traitées comme des **exigences à part entière**, au
niveau **cadrage** : NFR + critères **ciblés** (non exhaustifs). Chaque NFR porte un identifiant
`NFR-⟨AXE⟩-⟨n⟩` (§1.4) et renvoie aux user stories, personas ou référentiels qui le **portent**.

### 7.1 Accessibilité — RGAA / WCAG 2.1 AA *(exigence la plus pondérée)*

Cheville opérationnelle : le **référentiel d'étiquettes §2.3**, cité par les critères d'acceptation de
chaque user story.

| NFR | Exigence | Porté par |
|---|---|---|
| `NFR-A11Y-01` | Conformité cible **RGAA / WCAG 2.1 AA** sur l'application client **et** l'interface de tchat. | §2.3 ; toutes les US §3-§6 |
| `NFR-A11Y-02` | **Accessibilité par user story** : chaque US cite ses **étiquettes §2.3** dans ses critères (ADR-004). | US §3-§6 |
| `NFR-A11Y-03` | **Livrables eux-mêmes accessibles** : hiérarchie de titres, tableaux à en-têtes, alternatives textuelles, intitulés de liens signifiants. | CDC, architecture, README |
| `NFR-A11Y-04` | **Contrôle d'accessibilité** (revue par critères RGAA + tests automatisables) avant mise en production. | Processus de développement (revue + CI) |

*Priorité : Must.*

### 7.2 Internationalisation (i18n / l10n)

| NFR | Exigence | Porté par |
|---|---|---|
| `NFR-I18N-01` | **Multi-langue** : interface et e-mails (vérification, réinitialisation) dans la **langue de l'utilisateur**. | P1 ; US-AUTH-02 |
| `NFR-I18N-02` | **Multi-devise** : tarifs et paiement affichés dans la **devise** pertinente. | US-LOC-03 ; US-PAY-01 |
| `NFR-I18N-03` | **Fuseaux horaires** : dates et heures de prise / retour interprétées et affichées sans ambiguïté. | US-LOC-02 ; P1 |
| `NFR-I18N-04` | **Formats locaux** (dates, nombres) adaptés à la locale. | US d'affichage |

*Priorité : Must (déploiement international pour tous les clients — v0).*

### 7.3 Sécurité

| NFR | Exigence | Porté par |
|---|---|---|
| `NFR-SEC-01` | **Authentification** e-mail / mot de passe + **RBAC** (client / agent de support) ; **hachage argon2id**. | ADR-002 ; US-AUTH-* |
| `NFR-SEC-02` | **Transport chiffré TLS 1.2+/1.3** partout ; **wss** pour le tchat. | §6 ; tout échange |
| `NFR-SEC-03` | **Gestion des secrets** via gestionnaire dédié (aucun secret en clair dans le code / la config). | architecture |
| `NFR-SEC-04` | **Anti-énumération** : messages neutres à la connexion et à la réinitialisation. | US-AUTH-03 / US-AUTH-05 |
| `NFR-SEC-05` | **Paiement externalisé** : aucune donnée de carte stockée ; PCI-DSS délégué au prestataire. | US-PAY-01 |
| `NFR-SEC-06` | **Journalisation** des actions sensibles (accès API agences, mises à jour de données). | §5 |
| `NFR-SEC-07` | **Dépendances** : analyse de composition logicielle (**SCA**) en intégration continue + mises à jour. | Intégration continue (CI) |

**Constats de l'audit → remédiations** *(synthèse ; l'audit complet figure dans la proposition d'architecture, le §7 pose les exigences cibles)* :

| Constat (existant) | Remédiation cible |
|---|---|
| Mots de passe en **SHA-1** (FR/DE/ES/IT) | **argon2id** (`NFR-SEC-01`) |
| **TLS 1.0** encore actif (FR, IT) | **TLS 1.2+/1.3**, wss (`NFR-SEC-02`) |
| **Secrets en fichiers** de configuration | **Gestionnaire de secrets** (`NFR-SEC-03`) |
| **35–41 % de dépendances vulnérables** | **SCA en CI** + mises à jour (`NFR-SEC-07`) |

> Les cibles de **fiabilité / disponibilité (SLA / SLO)** sont posées dans la **proposition
> d'architecture**, à partir des constats de l'**audit de l'existant**.

*Priorité : Must.*

### 7.4 RGPD

| NFR | Exigence | Porté par |
|---|---|---|
| `NFR-RGPD-01` | **Minimisation** : ne collecter que les données nécessaires à la finalité. | US de collecte |
| `NFR-RGPD-02` | **Droit à l'effacement** : suppression de compte = **effacement / anonymisation** des données personnelles + **conservation légale anonymisée** des données transactionnelles. | ADR-010 ; US-PROF-03 |
| `NFR-RGPD-03` | **Permis de conduire = donnée réglementée** : finalité location, conservation / anonymisation encadrées. | ADR-013 ; US-LOC-04 |
| `NFR-RGPD-04` | **Information & consentement** : finalités explicites, mentions légales. | inscription ; réservation |
| `NFR-RGPD-05` | **Transferts UE ↔ Amérique du Nord** encadrés par des mécanismes légaux (clauses contractuelles types / décision d'adéquation). | déploiement international |
| `NFR-RGPD-06` | **Traçabilité** des accès aux données personnelles (journalisation). | §5 ; `NFR-SEC-06` |
| `NFR-RGPD-07` | **Droit d'accès et portabilité** : le client peut **récupérer l'ensemble de ses données personnelles** dans un **format réutilisable** (structuré, lisible par machine). | US-PROF-04 ; pendant de `NFR-RGPD-02` |

*Priorité : Must (conformité légale).*

### 7.5 Écoconception

Set **concis et concret** (pas un catalogue) :

| NFR | Exigence | Porté par |
|---|---|---|
| `NFR-ECO-01` | **Sobriété des échanges** : payloads minimaux, pagination, pas de sur-fetch d'API. | recherche §4 ; API §5 |
| `NFR-ECO-02` | **Optimisation des médias** : images responsive, formats modernes, chargement différé. | application client |
| `NFR-ECO-03` | **Tchat sans polling inutile** : transport **WebSocket événementiel** (pas de scrutation HTTP) ; fermeture des connexions inactives. | §6 |
| `NFR-ECO-04` | **Mise en cache** (HTTP / référentiels) pour éviter les requêtes répétées. | application client ; API |
| `NFR-ECO-05` | **Budget de performance** (poids de page, nombre de requêtes) défini et mesuré. | application client |

*Priorité : Should (important, non bloquant pour la v1).*

### 7.6 Liens transverses
- Décisions sous-jacentes : **ADR-004** (transverses retenues), **ADR-002** (auth / RBAC), **ADR-010**
  (suppression / RGPD), **ADR-013** (permis). Détail dans le registre des décisions (annexe).
- **Accessibilité** : référentiel et étiquettes en **§2.3** ; application par user story aux §3-§6.
- **Audit → remédiations** : développé dans l'**audit de l'existant** ; les remédiations cibles
  (sécurité) sont posées ici et reprises dans la **proposition d'architecture**.
- La **matrice de traçabilité** (§8) reliera *besoins → user stories → NFR*.
