## 8. Traçabilité, hypothèses et couverture

Cette dernière section rend le cahier des charges **vérifiable** : aucun besoin du v0 n'est orphelin,
aucune user story n'est hors-sol, les hypothèses sont listées (détail dans le registre des
décisions), et le périmètre fonctionnel est couvert.

### 8.1 Couverture des besoins du v0 *(aucun besoin orphelin)*

Chaque fonctionnalité listée dans le cahier des charges initial (v0) est couverte par au moins une
user story :

| Besoin du v0 | Couvert par |
|---|---|
| Consulter son profil | US-PROF-01 |
| Modifier ses informations personnelles | US-PROF-02 |
| Supprimer son compte (avec mot de passe) | US-PROF-03 |
| Consulter la liste des agences | US-LOC-01 |
| Afficher les offres (formulaire de recherche) | US-LOC-02 |
| Consulter le détail d'une offre | US-LOC-03 |
| Réserver (informations + paiement) | US-LOC-04 + US-PAY-01 |
| Consulter l'historique des réservations | US-LOC-05 |
| Modifier et annuler une réservation | US-LOC-06 + US-LOC-07 |
| Modification possible jusqu'à 48 h | US-LOC-06 (ADR-011) |
| Remboursement 25 % à moins d'une semaine | US-LOC-07 (ADR-011) |
| Paiement externalisé (prestataire en ligne) | US-PAY-01 ; NFR-SEC-05 |
| Catégories de véhicule (norme ACRISS) | US-LOC-02 / US-LOC-03 (ADR-008) |
| API CRUD pour les applications d'agence | §5.1 ; ADR-001 |

→ **Aucun besoin du v0 orphelin.**

### 8.2 Sources des user stories *(aucune user story hors-sol)*

Chaque user story renvoie à une source — *v0*, *implicite v0*, *énoncé* ou *[HYP]* (registre) :

| User story | Source |
|---|---|
| US-AUTH-01..05 (authentification) | implicite v0 → ADR-002 |
| US-PROF-01 / US-PROF-02 (profil) | v0 |
| US-PROF-03 (suppression de compte) | v0 + ADR-010 (RGPD) |
| US-PROF-04 (export des données personnelles) | **[HYP] ADR-016** — droit d'accès / portabilité (RGPD) |
| US-LOC-01..03, US-LOC-05 (agences, recherche, offre, historique) | v0 |
| US-LOC-04 (réservation) | v0 + ADR-013 |
| US-LOC-06 / US-LOC-07 (modification, annulation) | v0 + ADR-011 |
| US-PAY-01 (paiement) | v0 + ADR-011 |
| US-CHAT-01 / US-CHAT-02 (tchat) | **[HYP] ADR-015** — ajout au périmètre (énoncé étape 4 + autoévaluation C.1.5) |

→ **Aucune user story hors-sol** (chaque US tracée à une source).

### 8.3 Hypothèses retenues

Zones d'ombre du v0 comblées par décision — **détail dans le registre des décisions**
(`registre-decisions.md`), non recopié ici :

| Hypothèse | ADR |
|---|---|
| Consultation publique sans compte (profil Visiteur) | ADR-009 |
| Offres au niveau catégorie ACRISS (pas de parc à l'unité) | ADR-008 |
| Matrice modification / annulation / remboursement (annulation tardive : 0 % à moins de 48 h) | ADR-011 |
| Relation agence / ville / offre | ADR-012 |
| Champs de réservation (permis, âge minimal) | ADR-013 |
| Clôture (confirmée → terminée) via l'API, au retour du véhicule | ADR-014 |
| Tchat = ajout au périmètre v0 | ADR-015 |
| Export self-service des données personnelles (v1) | ADR-016 |

**Tranchés dans la proposition d'architecture** (livrable 2) : le **prestataire de paiement**
(**ADR-021** — mécanisme externalisé, Stripe comme instance) et les **cibles de fiabilité /
disponibilité** (**SLO — ADR-017**). Le cahier des charges en pose le besoin ; la proposition
d'architecture en arrête les valeurs.

### 8.4 Couverture du périmètre fonctionnel

Les trois éléments du périmètre (§1.3) sont couverts :

| Élément du périmètre | Couvert par |
|---|---|
| **Application client** | §3 (authentification, profil), §4 (recherche, réservation, paiement, gestion), §6 côté client (US-CHAT-01), exigences transverses §7 |
| **API pour applications d'agence tierces** | §5.1 (API CRUD par domaine) ; `NFR-SEC-06` ; intégration détaillée dans la proposition d'architecture (C.1.7) |
| **Tchat de support (Customer + Agent)** | §6 (US-CHAT-01 / US-CHAT-02), §5.2 (agent de support) ; validé par la preuve de concept |

### 8.5 Clôture du cahier des charges

Le périmètre fonctionnel est **entièrement couvert et tracé** ; les exigences transverses (§7)
s'appliquent à l'ensemble. Le détail des décisions figure dans `registre-decisions.md`. La
**proposition d'architecture** (livrable 2) prend le relais pour la conception technique.
