## 9. Bonnes pratiques — sécurité, accessibilité, écoconception

Ce chapitre pose les **bonnes pratiques transverses** de la cible sur trois volets — **sécurité**,
**accessibilité**, **écoconception** — au niveau **cadrage**.

### 9.1 Cadrage

Conformément à **ADR-004**, les exigences transverses sont des **exigences à part entière** ;
l'**accessibilité** est la **plus pondérée**. Le présent chapitre ne récite **aucun référentiel** : il
**cible ce produit** et, pour la sécurité, **répond nommément à l'audit**.

Ce volet **ferme le troisième sous-indicateur de C.1.3** (« exploiter l'audit pour orienter et
justifier la cible ») : la table de remédiation §9.2 répond, **constat par constat**, au verdict
« sécurité **non validée** » de l'audit (§2.5). La **sécurité propre aux intégrations tierces** (auth
machine, webhook signé, TLS des échanges) a été traitée au **chapitre 8** ; elle est **référencée**
ici, **pas re-détaillée**.

### 9.2 Sécurité — remédiation de la dette d'audit

Chaque pratique ci-dessous **pointe un constat d'audit** ou une **exigence `NFR-SEC`** : sans cet
ancrage, elle ne figure pas dans ce chapitre. Les **quatre constats de sécurité** de l'audit sont
**tous** adressés.

| Constat d'audit | État existant | Remédiation cible | Ancrage |
|---|---|---|---|
| `AUD-10` | **SHA-1** (FR/DE/ES/IT) — hachage cryptographiquement obsolète | **argon2id** sur **tout** le parc unifié | `NFR-SEC-01` / ADR-019 |
| `AUD-11` | **TLS 1.0** résiduel (FR, IT) | **TLS 1.2+ / HTTPS partout**, **wss** pour le tchat | `NFR-SEC-02` |
| `AUD-12` | **Secrets en fichiers**, sans rotation ; KeyVault partiel | **Gestionnaire de secrets centralisé + rotation** (forme générale du secret rotable du ch.08) | `NFR-SEC-03` |
| `AUD-13` | **11 → 41 % de dépendances vulnérables** | **Analyse de composition logicielle (SCA) en CI/CD** + politique de mise à jour | `NFR-SEC-07` ; CI/CD (`NFR-SLO-03`, ADR-017) |

Pratiques transverses **complémentaires**, chacune ancrée :

| Pratique cible | Ancrage |
|---|---|
| **RBAC humain** (client / agent de support) sur l'argon2id unifié | ADR-002 / `NFR-SEC-01` |
| **Deux plans d'autorisation** distincts (humain / machine) — *détaillé au ch.08* | ADR-002 / ADR-018 |
| **Journalisation des actions sensibles** (accès API, mises à jour de données) | `NFR-SEC-06` ; `NFR-RGPD-06` |
| **Anti-énumération** : messages neutres à la connexion / réinitialisation | `NFR-SEC-04` |
| **Données réglementées** (numéro de permis) : **minimisation** + protection en transit / au repos | ADR-013 / `NFR-RGPD-01` / `NFR-RGPD-03` |

> La **sécurité des intégrations tierces** (OAuth2 client-credentials, scopes, webhook signé et
> idempotent) est traitée au **chapitre 8** ; le **secret rotable** y évoqué trouve **ici** sa forme
> générale — un **gestionnaire de secrets pour toute la cible**, pas seulement les agences.

### 9.3 Accessibilité (RGAA / WCAG 2.1 AA) — la plus pondérée

Conformément à **ADR-004**, l'accessibilité se joue à **deux niveaux**, comme depuis le début du projet.

**Accessibilité du produit** (critères ciblés sur **ce produit**, `NFR-A11Y-01` / `NFR-A11Y-02`) :

- **navigation au clavier** complète sur les parcours (recherche, réservation, paiement, tchat) ;
- **contrastes** et **libellés de formulaires** explicites (saisie d'identité, de permis, de paiement) ;
- **alternatives textuelles** des contenus non textuels ;
- **tchat temps réel accessible** : annonce des **nouveaux messages aux lecteurs d'écran** (régions
  **ARIA live**), focus géré — l'interface de tchat est concernée au même titre que le reste
  (`NFR-A11Y-01`).

**Accessibilité des livrables eux-mêmes** (`NFR-A11Y-03`) : **hiérarchie de titres régulière**,
**tableaux à en-têtes**, **alternatives textuelles de tous les diagrammes Mermaid** — pratique tenue
depuis le chapitre 2. Un **contrôle d'accessibilité en intégration continue** (`NFR-A11Y-04`) précède la
mise en production.

**Lien métier.** La persona **P4 (cliente sourde)** est exclue du support téléphonique : le **tchat
texte** est le **canal inclusif** (ADR-015) — l'accessibilité n'est pas un ornement, elle **porte** un
besoin réel.

### 9.4 Écoconception

Pratiques **ancrées** (`NFR-ECO`), reliées à des **choix d'architecture déjà faits** plutôt qu'à des
mesures inventées :

| Pratique cible | Rattachement |
|---|---|
| **Sobriété des échanges** : payloads minimaux, pagination, pas de sur-*fetch* | `NFR-ECO-01` ; API REST (ADR-019) |
| **Tchat événementiel** : **WebSocket en *push***, **aucun *polling*** HTTP ; fermeture des connexions inactives | `NFR-ECO-03` ; passerelle in-process (ADR-003) |
| **Mise à l'échelle élastique** : instances **ajoutées / retirées selon la charge**, plutôt qu'un **surdimensionnement permanent** | `NFR-ECO` ; scaling horizontal (ADR-017) |
| **Base unifiée** : évite la **duplication multi-bases** de l'existant (gâchis de ressources) | lien `AUD-03` ; ADR-019 |
| **Mise en cache** + **budget de performance** mesuré | `NFR-ECO-04` / `NFR-ECO-05` |

L'écoconception **découle** ici de la **sobriété** déjà retenue (modulithe sobre, *scaling* élastique,
base unifiée) : la cible est plus frugale que l'existant **par construction**, pas par une couche de
mesures ajoutées.

### 9.5 Synthèse — fermeture de C.1.3

L'audit (§2.5) déclarait la **sécurité « non validée »**. La cible y **répond constat par constat** —
SHA-1 → argon2id (`AUD-10`), TLS 1.0 → TLS 1.2+/wss (`AUD-11`), secrets en fichiers → gestionnaire +
rotation (`AUD-12`), dépendances vulnérables → SCA en CI (`AUD-13`) — chaque correction **ancrée** (table
§9.2). Le **troisième sous-indicateur de C.1.3** (exploiter l'audit pour **justifier** la cible) est
ainsi **bouclé**.

**Rattachement au registre.**

| Volet | Décisions et exigences |
|---|---|
| Sécurité (remédiation) | `AUD-10`→`AUD-13` ; `NFR-SEC-01/02/03/04/06/07` ; ADR-002 / ADR-013 / ADR-018 / ADR-019 ; `NFR-SLO-03` (CI/CD) |
| Accessibilité | ADR-004 / ADR-015 ; `NFR-A11Y-01`→`04` |
| Écoconception | `NFR-ECO-01`→`05` ; ADR-003 / ADR-017 / ADR-019 ; lien `AUD-03` |

**Anti-sur-ingénierie.** Aucune récitation de référentiel (OWASP / WCAG / GreenIT) : **chaque pratique a
un ancrage** `AUD-NN` ou `NFR`, sinon elle est **hors de ce chapitre**.
