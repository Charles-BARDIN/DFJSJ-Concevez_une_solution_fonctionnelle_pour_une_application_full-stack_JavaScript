## 4. Exigences fonctionnelles — Recherche, réservation et paiement

Cette section couvre le **parcours de location** : consultation et recherche (ouvertes au
**Visiteur**), puis réservation, paiement et gestion (réservées au **Client**). Elle s'appuie sur
les décisions tracées : **catégories ACRISS** (ADR-008), **relation agence/ville/offre** (ADR-012),
**politique modification/annulation/remboursement** (ADR-011) et **champs de réservation** (ADR-013).
Le **paiement est externalisé** (v0) ; le choix du prestataire et l'intégration technique relèvent de
la proposition d'architecture et des exigences de sécurité.

*Convention (rappel §1.4) : priorité MoSCoW, critères « Étant donné / Quand / Alors », **étiquettes
d'accessibilité** (§2.3), source.*

### 4.1 Consultation et recherche *(Visiteur)*

**US-LOC-01 — Consulter la liste des agences** · *Must* · *v0*
> En tant que **visiteur**, je veux **consulter la liste des agences de location**, afin de **repérer les points de retrait et de retour**.

- Quand j'ouvre la liste des agences, alors chaque agence est présentée avec sa **ville** et ses informations de localisation.
- Je peux filtrer la liste par **ville** (cohérent avec ADR-012 : une agence appartient à une ville).
- **Accessibilité** : `A11Y-STRUCTURE`, `A11Y-CLAVIER`.

**US-LOC-02 — Rechercher des offres** · *Must* · *v0*
> En tant que **visiteur**, je veux **rechercher des offres** (ville de départ, ville de retour, date et heure de début, date et heure de retour, catégorie ACRISS), afin de **voir les locations correspondant à mon besoin**.

- Étant donné un formulaire complété avec des critères valides, quand je lance la recherche, alors le système renvoie les offres des **agences situées dans les villes demandées** (ADR-012), pour la **catégorie ACRISS** et la **période** indiquées.
- Étant donné des dates incohérentes (retour avant départ, période passée), quand je valide, alors une **erreur explicite** est affichée et une correction est suggérée.
- Les **dates et heures** sont interprétées dans le **fuseau horaire** pertinent (i18n, §7).
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-CLAVIER`, `A11Y-LANGUE`, `A11Y-NOM-ROLE`.

**US-LOC-03 — Consulter le détail d'une offre** · *Must* · *v0*
> En tant que **visiteur**, je veux **consulter le détail d'une offre**, afin de **vérifier ses caractéristiques avant de réserver**.

- Quand j'ouvre une offre, alors sont affichés : **agences de retrait et de retour** (et leurs villes), **période**, **catégorie ACRISS**, **tarif** (dans ma **devise** — i18n, §7) et un **résumé des conditions** de modification/annulation (ADR-011).
- **Accessibilité** : `A11Y-STRUCTURE`, `A11Y-CONTRASTE`, `A11Y-CLAVIER`.

### 4.2 Réservation et paiement *(Client)*

**US-LOC-04 — Réserver une offre** · *Must* · *v0 + ADR-013*
> En tant que **client**, je veux **réserver une offre en fournissant mes informations**, afin de **confirmer ma location**.

- Étant donné un client authentifié, quand il réserve une offre, alors un formulaire collecte les **informations requises** ; les champs **déjà présents dans le profil sont pré-remplis** (« si présentes » — v0) et restent modifiables.
- Les informations comprennent : nom, prénom, date de naissance, adresse, e-mail (profil) + **numéro de permis de conduire** et vérification de l'**âge minimal** (ADR-013).
- Étant donné un **âge inférieur au minimum requis** (selon catégorie ACRISS / pays), quand je valide, alors la réservation est **bloquée** avec un message clair.
- Le **numéro de permis** est une **donnée réglementée** : sa collecte respecte la **minimisation RGPD** (ADR-010 / ADR-013, détaillé en §7).
- Une fois les informations validées, la réservation passe à l'étape **paiement** (US-PAY-01).
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-CLAVIER`, `A11Y-LANGUE`, `A11Y-NOM-ROLE`.

**US-PAY-01 — Payer la réservation** · *Must* · *v0 + ADR-011*
> En tant que **client**, je veux **payer ma réservation via un service sécurisé**, afin de **confirmer définitivement ma location**.

- Étant donné une réservation en attente de paiement, quand je procède au paiement, alors celui-ci est **traité par un prestataire externe** (v0) et **aucune donnée de carte n'est stockée** par l'application.
- Étant donné une **confirmation de paiement** reçue du prestataire, quand elle est validée, alors la réservation passe à l'état **confirmée** et un **récapitulatif** est fourni.
- Étant donné un **échec ou un abandon** de paiement, quand il survient, alors la réservation **n'est pas confirmée**, reste reprenable, et un message clair est affiché.
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-CLAVIER`, `A11Y-DELAIS`, `A11Y-LANGUE`.

### 4.3 Suivi et gestion des réservations *(Client)*

**US-LOC-05 — Consulter l'historique de ses réservations** · *Must* · *v0*
> En tant que **client**, je veux **consulter l'historique de mes réservations (passées et en cours)**, afin de **les suivre et les gérer**.

- Quand j'ouvre mon historique, alors mes réservations passées et en cours sont listées avec leur **état** (confirmée, modifiée, annulée, terminée) et leurs informations clés.
- **Accessibilité** : `A11Y-STRUCTURE`, `A11Y-CLAVIER`.

**US-LOC-06 — Modifier une réservation** · *Should* · *v0 + ADR-011*
> En tant que **client**, je veux **modifier une réservation**, afin d'**adapter ma location tant que c'est permis**.

- Étant donné une réservation à **plus de 48 h** du début, quand je modifie ses paramètres (dates, catégorie, agences…), alors la modification est **autorisée** (ADR-011).
- Étant donné une réservation à **48 h ou moins** du début, quand je tente de modifier, alors la modification est **refusée** avec un message clair (ADR-011).
- Étant donné une modification **changeant le tarif**, quand je la confirme, alors l'écart est réglé via le **prestataire de paiement externe** — **complément** (hausse) ou **remboursement partiel** (baisse) — confirmé par le **prestataire** ; la réservation n'est mise à jour qu'**après confirmation**.
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-CLAVIER`, `A11Y-LANGUE`, `A11Y-DELAIS`.

**US-LOC-07 — Annuler une réservation** · *Must* · *v0 + ADR-011*
> En tant que **client**, je veux **annuler une réservation**, afin d'**être remboursé selon les conditions**.

- Étant donné le **créneau avant le début**, quand j'annule, alors le **remboursement** applique la matrice ADR-011 : **> 1 semaine → 100 %** ; **≤ 1 semaine et > 48 h → 25 %** ; **≤ 48 h → 0 % (annulation tardive)**.
- Le **remboursement** éventuel est exécuté via le **prestataire de paiement externe**, confirmé par le **prestataire** ; l'état passe à **annulée** après confirmation.
- Avant validation, un **récapitulatif** indique le **montant remboursé** en **langage clair** (action irréversible).
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-LANGUE`, `A11Y-CLAVIER`, `A11Y-DELAIS`.

### 4.4 Règles métier et liens transverses

**Politique de modification / annulation / remboursement** (ADR-011, référence = début de la location) :

| Créneau avant le début | Modification | Annulation — remboursement |
|---|---|---|
| > 1 semaine | Autorisée | 100 % |
| ≤ 1 semaine et > 48 h | Autorisée | 25 % |
| ≤ 48 h (annulation tardive) | Refusée | 0 % |

- **Catégories de véhicule** : norme **ACRISS** (ADR-008) ; les offres et réservations sont au **niveau catégorie** (pas de gestion du parc à l'unité).
- **Modèle agence / ville / offre** : ADR-012 — la recherche par ville se résout vers les **agences** de ces villes, qui portent les offres (retrait/retour en agence ; aller simple possible).
- **Informations de réservation** : ADR-013 ; le **numéro de permis** relève de la **minimisation et de la conservation RGPD** (ADR-010, §7).
- **Paiement et remboursements** : **externalisés** (v0) ; intégration prestataire (confirmation du paiement, **aucune donnée de carte stockée**) précisée dans la **proposition d'architecture** et en **§7**.
- **États de réservation** (en attente de paiement → confirmée → modifiée / annulée / terminée / no-show) : la **machine à états** est formalisée dans la **proposition d'architecture** (modèle de données et diagrammes).
