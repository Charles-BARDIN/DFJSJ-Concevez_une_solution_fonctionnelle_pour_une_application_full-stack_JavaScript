# Proposition d'architecture — Your Car Your Way

| | |
|---|---|
| **Projet** | Your Car Your Way — nouvelle application web centralisée |
| **Document** | Proposition d'architecture (livrable 2) |
| **Version** | 1.0 |
| **Date** | Juin 2026 |
| **Auteur** | Simon Charles Paul Bardin |

## 1. Introduction

### 1.1 Objet du document

Ce document est la **proposition d'architecture** de la nouvelle application **Your Car Your Way
(YCYW)**. Il fait suite au **cahier des charges fonctionnel**, qui consolide les besoins,
et précède la **preuve de concept**, qui valide la brique temps réel.

Le document a **deux natures complémentaires**, dont l'**articulation est cadrée ici, au-dessus des
deux** :

1. un **audit de l'existant** (chapitre 2) — un **diagnostic** technique des applications actuelles ;
2. une **proposition d'architecture cible** (chapitres 3 et suivants) — la **solution** retenue et sa
   justification, les spécifications techniques, les modèles (UML, données), l'intégration des
   composants tiers et les bonnes pratiques transverses.

L'audit **alimente** la proposition cible : ses constats — identifiés `AUD-NN` (§1.3) — sont **repris
en remédiation** dans les chapitres de solution.

### 1.2 Frontière audit / proposition de solution

L'**audit** et la **proposition de solution** sont **deux parties
distinctes**. Le **chapitre 2 diagnostique** l'existant — forces, faiblesses, contraintes — et établit
si les critères de qualité sont **validés ou non** ; il **ne choisit pas** l'architecture cible. Le
**choix** de l'architecture, sa **justification** et les **alternatives écartées** relèvent des
**chapitres de proposition** (3 et suivants) et du **registre des décisions**. L'audit peut **pointer
des directions** de remédiation, sans préjuger de la solution.

### 1.3 Démarche et conventions

**Démarche.** Le document part des **besoins** et de la **description technique de
l'existant**, en tire un **audit** (chapitre 2), puis en déduit une **architecture cible justifiée**
(chapitres suivants). Les décisions structurantes — fonctionnelles et techniques — sont consignées
dans le **[registre des décisions](../registre-decisions.md)**, au format
ADR.

**Conventions de rédaction.**

- **Diagrammes** : réalisés en **Mermaid** ; **chaque diagramme est accompagné d'une alternative
  textuelle** décrivant son contenu et ses relations (exigence d'accessibilité des livrables,
  **ADR-004**).
- **Références de décision** : tout choix renvoie à son ADR (`ADR-NNN`) dans le registre.
- **Constats d'audit** : chaque constat est **identifié `AUD-NN`** afin d'être repris, en aval, par
  les décisions d'architecture — la traçabilité **constat → remédiation** est ainsi préservée.

**Accessibilité du document.** Ce document respecte une **hiérarchie de titres régulière**, des
**tableaux à en-têtes explicites** et des **intitulés de liens signifiants** ; tout diagramme est
accompagné d'une **alternative textuelle** (**ADR-004**).

### 1.4 Plan du document

La proposition d'architecture s'organise en chapitres continus :

1. **Introduction** *(chapitre courant)* — objet, frontière audit / solution, démarche, conventions.
2. **Audit de l'existant** — diagnostic technique : architectures (par pays et globale), état des
   lieux (fiabilité, sécurité, disponibilité), validation des critères de qualité.
3. **Spécifications techniques et exigences non fonctionnelles** — spécifications de cadrage
   (agnostiques en technologie) et NFR cible (dont fiabilité / disponibilité et authentification
   machine de l'API).
4. **Choix technologiques et alternatives** — sélection et justification de la stack, couche par
   couche, avec alternatives comparées.
5. **Architecture cible** — vues de composants et de déploiement : **modulithe** (contraction de
   *monolithe modulaire*, ADR-003), module temps réel séparable, déploiement régional.
6. **Modèle de données et de classes** — vue de classes (domaines location et tchat), machine à états
   de la réservation, schéma relationnel.
7. **Vues dynamiques** — diagrammes de séquence des flux porteurs (réservation-paiement-webhook,
   modification tarifaire, tchat).
8. **Intégration des composants tiers** — applications d'agence (API) et prestataire de paiement :
   protocoles, interopérabilité, compatibilité et sécurité des intégrations.
9. **Bonnes pratiques** — sécurité (remédiation des constats d'audit), accessibilité (RGAA / WCAG 2.1
   AA), écoconception.
10. **Synthèse et couverture** — récapitulatif de la cible et carte de couverture des indicateurs.
