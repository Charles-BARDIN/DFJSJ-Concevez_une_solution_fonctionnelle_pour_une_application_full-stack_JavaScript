## 6. Exigences fonctionnelles — Support client en temps réel (tchat)

> **Ajout au périmètre v0 (hypothèse — ADR-015).** Le tchat **n'est pas dans le cahier des charges
> v0** ; il est **introduit ici comme un besoin métier réel** — « assistance client en temps
> réel » — **et validé par la preuve de concept**, et non comme une fonctionnalité hors-sol.

### 6.1 Besoin métier et justification

Le support en temps réel répond à un besoin d'**assistance immédiate** (réservation, paiement,
modification). Il est **justifié par l'accessibilité** : la persona **P4 (cliente sourde, §2.2)** est
**exclue du support téléphonique** ; un **canal texte en temps réel** est le **canal inclusif** qui
lui permet d'être assistée. Le tchat valide en outre la **brique temps réel** de l'architecture
cible (**module séparable**, ADR-003) et fait l'objet de la **preuve de concept**.

Le support a **deux côtés** : le **Customer** (client) et l'**Agent** de support (persona P6).
L'agent **accède aux conversations en attente et en prend une en charge** dans le cadre du tchat
(US-CHAT-02 ci-dessous) ; l'**Agent de support** est le **seul usage « personnel »** du périmètre
(§5).

### 6.2 User stories

**US-CHAT-01 — Obtenir de l'aide en temps réel (Customer)** · *Must* · *[HYP] ADR-015 (ajout périmètre) — justif. accessibilité P4*
> En tant que **client**, je veux **échanger en temps réel avec un agent de support**, afin d'**obtenir de l'aide immédiate, y compris si je ne peux pas utiliser le téléphone**.

- Étant donné un client **authentifié**, quand il ouvre le support, alors une **connexion temps réel** est établie après une **authentification** (authentification valide **acceptée**).
- Étant donné une **authentification absente ou invalide**, quand la connexion est tentée, alors elle est **rejetée**.
- Étant donné une conversation ouverte, quand le client envoie un message, alors l'agent le reçoit **en temps réel**, et réciproquement (**échange Customer ↔ Agent**).
- Étant donné un participant, quand il accède au support, alors il **n'accède qu'à sa propre conversation** (**isolation de conversation**).
- Étant donné une **coupure réseau**, quand la connexion est perdue, alors le client en est informé et la session **se reconnecte** (**dégradation gracieuse + reconnexion**) ; l'**historique** de la conversation est préservé.
- **Accessibilité** : canal **texte** inclusif (P4) ; `A11Y-STRUCTURE`, `A11Y-CLAVIER`, `A11Y-NOM-ROLE` (nouveaux messages **annoncés** via message de statut), `A11Y-ALTERNATIVES`.

**US-CHAT-02 — Prendre en charge une conversation et répondre (Agent)** · *Must* · *[HYP] ADR-015*
> En tant qu'**agent de support**, je veux **accéder aux conversations en attente, en prendre une en charge et échanger en temps réel avec le client**, afin de **l'assister**.

- Étant donné des conversations en attente, quand l'agent en prend une, alors elle lui est **attribuée** et il n'accède qu'**aux conversations qui lui sont attribuées** (isolation).
- Étant donné une conversation **prise en charge**, quand l'agent envoie un message, alors le client le reçoit **en temps réel**.
- Le **rôle Agent** est **dérivé de son authentification** (liaison identité/rôle).
- **Accessibilité** : `A11Y-STRUCTURE`, `A11Y-CLAVIER`, `A11Y-NOM-ROLE`, `A11Y-ALTERNATIVES`.

### 6.3 Critères validés par la preuve de concept
La PoC démontre **exactement** les critères de sécurité et de temps réel ci-dessus (cohérence
exigée entre la spécification et la preuve de concept) :

| Critère d'acceptation (§6.2) | Démontré par la PoC |
|---|---|
| Handshake authentifié : jeton valide accepté ; absent/invalide **rejeté** | Test d'intégration du handshake |
| **Liaison identité/rôle** : Customer vs Agent dérivés du jeton | Helper « stub du service d'identité » + test |
| **Échange Customer ↔ Agent** en temps réel | Test à deux clients WebSocket |
| **Isolation de conversation** — par **appartenance** (un participant, client ou agent, n'accède qu'aux conversations dont il est membre ; un non-participant est refusé) | Test d'isolation : non-participant refusé, **côté client et côté agent** |

La PoC valide ainsi la **brique technique à risque** — le temps réel sécurisé : handshake authentifié,
liaison identité/rôle et **isolation par appartenance** —, l'aspect architectural le plus à risque de la
cible, qu'une preuve de concept ciblée valide. L'**attribution** explicite d'une conversation à un agent (passage « en attente » →
« prise en charge », US-CHAT-02) est une **feature applicative** construite **au-dessus** de cette
brique, hors du périmètre de validation de la PoC (« un seul aspect technique », pas un produit final).

> La **stack d'identité** (hachage des mots de passe, émission/refresh des jetons, vérification e-mail,
> gestion des secrets, **transport chiffré**) est **spécifiée à l'architecture (§7)** et **stubée** dans la PoC
> (jeton de test forgé par un helper étiqueté). Le **transport temps réel sur client web**, la
> **dégradation gracieuse** et la **reconnexion** sont assumés et précisés dans la **proposition d'architecture**.

### 6.4 Liens transverses
- **Architecture** : module temps réel **séparable** (gateway extractible, ADR-003) ; transport temps réel, **reconnexion / dégradation gracieuse**, **persistance des messages** (historique), sécurité de la connexion authentifiée.
- **Preuve de concept** : périmètre strict — **Customer + Agent**, connexion authentifiée, échange, isolation ; **harness HTML nu** pour la démonstration ; **aucune** stack d'identité réimplémentée.
- **Accessibilité** : le canal **texte** sert P4 ; l'interface de tchat respecte les étiquettes a11y (messages **annoncés**, **opérable au clavier**).
