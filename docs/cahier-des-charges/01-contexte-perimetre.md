# Cahier des charges fonctionnel — Your Car Your Way (Option B)

| | |
|---|---|
| **Projet** | Your Car Your Way — nouvelle application web centralisée |
| **Document** | Cahier des charges fonctionnel (livrable 1) |
| **Version** | 1.0 |
| **Date** | Juin 2026 |
| **Auteur** | Simon Charles Paul Bardin |

## 1. Introduction

### 1.1 Objet du document

Ce document **est le cahier des charges fonctionnel de référence** de l'application
**Your Car Your Way (YCYW)**. Il exprime les besoins du **point de vue métier et utilisateur** —
sous forme de *user stories* assorties de **critères d'acceptation** — ainsi que les **exigences
transverses** (non fonctionnelles).

Il reste au niveau **cadrage** : il décrit *ce que* le système doit permettre, sans préjuger du
*comment*, qui relève de la proposition d'architecture. Il s'adresse autant aux parties
prenantes **non techniques** (validation des besoins) qu'aux parties prenantes **techniques**
(entrée de la conception), et sert de référence à la proposition d'architecture et à la preuve de
concept, qui en découlent.

La **spécification initiale fournie** constitue une **source** que ce document **intègre et étend** :
ses besoins sont repris et structurés, et les points qu'elle laissait ouverts sont **arbitrés et
signalés [HYP]**, selon la méthode décrite en **ADR-000**.

### 1.2 Contexte

YCYW est une entreprise de location de voitures à l'international, présente depuis plus de vingt ans
en Europe et récemment implantée en Amérique du Nord. Sa croissance s'est accompagnée d'une
**multiplication d'applications web distinctes selon les pays**, source de complexité technique,
d'**incohérences fonctionnelles** et de **difficultés de maintenance**.

L'entreprise souhaite une **nouvelle application web centralisée**, commune à l'ensemble de ses
clients, afin d'**unifier les usages**, d'**améliorer l'expérience utilisateur** et de poser des
**bases pérennes, évolutives et conformes** — en particulier en matière d'**accessibilité**.

Le diagnostic technique de l'existant (forces, faiblesses, contraintes) fait l'objet d'un **audit
dédié** dans la proposition d'architecture ; il n'est pas repris ici, sauf lorsqu'il éclaire
directement un besoin (par exemple les exigences de sécurité, §7).

### 1.3 Périmètre

#### 1.3.1 Périmètre fonctionnel du système cible

Le système cible est une **application web client centralisée** — le produit destiné aux clients —
adossée à une **API**, et complétée d'un **tchat de support** dont l'un des participants est un
**agent de support** :

| Élément | Description |
|---|---|
| **Application client** | Le produit : compte et profil, authentification, recherche et réservation de location, paiement, historique, modification / annulation, **support en temps réel (tchat)**. Destinée à tous les clients, **y compris les personnes en situation de handicap**. |
| **API (CRUD par domaine)** | Exposée aux **applications d'agence tierces existantes** (utilisateur, réservation, offre, agence…), conformément à l'exigence du v0. Ces applications sont des **composants tiers à intégrer** (modélisés dans la proposition d'architecture), **non développés ici**. |
| **Tchat de support** **[HYP]** | Échange en temps réel entre un **client (Customer)** et un **agent de support (Agent)** ; ce dernier est le **seul usage « personnel »** du périmètre. **Ajout au périmètre v0 — [HYP] ADR-015** (cf. §6). |

> **Respect de l'exclusion du v0.** Le v0 précise que l'application « *ne concerne pas les actions
> que les employés font en agence* » et demande seulement une **API** pour les applications
> d'agence. Le présent périmètre **respecte cette exclusion** : il n'y a **pas de seconde
> application** (pas de back-office) ; l'administration (offres, agences, réservations) est réalisée
> par les **applications d'agence tierces** via l'API. Voir **ADR-001** (registre des décisions).

Les **exigences transverses** (accessibilité, internationalisation, sécurité, RGPD, écoconception)
s'appliquent à l'application client et au tchat ; elles sont détaillées en **§7**.

#### 1.3.2 Hors périmètre

- Les **applications d'agence tierces** : elles **consomment** l'API mais ne sont ni spécifiées ni
  développées ici ; seul le **contrat d'API** les concerne (intégration des composants tiers,
  proposition d'architecture).
- Toute **application de gestion / back-office** propre à YCYW : **hors périmètre** —
  l'administration passe par les applications d'agence tierces.
- Les **opérations physiques en agence** non médiatisées par le système (remise des clés, état des
  lieux du véhicule, etc.).
- La **gestion du parc de véhicules à l'unité** (inventaire physique, affectation d'un véhicule
  précis, maintenance) : les offres sont exprimées au **niveau catégorie ACRISS** — voir
  **[HYP] ADR-008**.
- Les **applications mobiles natives** : le périmètre est une **application web** (responsive — usage multi-appareils, cf. persona **P1**, §2.2),
  conformément à l'énoncé.

> **Périmètre fonctionnel vs périmètre de réalisation.** Le présent **projet** relève du
> **cadrage** : il produit le cahier des charges, la proposition d'architecture et une **preuve de
> concept limitée au tchat**. Le développement complet de l'application client est **hors du
> périmètre de réalisation du projet**, mais bien dans le **périmètre fonctionnel** spécifié ici.

### 1.4 Démarche, conventions et hypothèses

**Démarche.** Les besoins sont consolidés à partir des sources de référence (v0, énoncé de la
mission, audit de l'existant), puis déclinés en **profils utilisateurs** (§2), en **user stories**
assorties de **critères d'acceptation** (§3 à §6) et en **exigences transverses** (§7). La
couverture et la traçabilité sont récapitulées en **§8**.

**Hypothèses.** Ce projet est mené **sans interlocuteur métier** disponible : chaque zone d'ombre du
v0 est comblée par une **hypothèse raisonnable, décidée et tracée** dans le **registre des décisions**
(annexe), au format ADR ; elle est signalée dans
le texte par la mention **[HYP]** suivie de la référence ADR. **Tout écart au v0 et tout ajout de
périmètre sont signalés [HYP] ; les exigences transverses (§7) découlent du mandat d'ADR-004.**

**Conventions de rédaction.**

- **Format des user stories** : « *En tant que* ⟨rôle⟩, *je veux* ⟨action⟩ *afin de* ⟨bénéfice⟩. »
- **Identifiants** : chaque user story porte un identifiant `US-⟨DOMAINE⟩-⟨n⟩` — domaines `AUTH`
  (authentification), `PROF` (profil), `LOC` (location), `PAY` (paiement), `CHAT` (support temps
  réel). Les exigences transverses portent `NFR-⟨AXE⟩-⟨n⟩` — axes `A11Y` (accessibilité), `I18N`
  (internationalisation), `SEC` (sécurité), `RGPD`, `ECO` (écoconception).
- **Critères d'acceptation** : conditions **vérifiables**, formulées autant que possible
  « *Étant donné… Quand… Alors…* ». **Lorsqu'il s'applique, un critère d'accessibilité dédié
  (RGAA / WCAG 2.1 AA) est systématiquement inclus** (voir **ADR-004**).
- **Priorisation (MoSCoW)** : **Must** (indispensable en v1), **Should** (important), **Could**
  (souhaitable), **Won't** (hors v1, conservé comme évolution).
- **Traçabilité** : chaque besoin renvoie à sa **source** (v0, énoncé, audit, ou **[HYP]**). La
  matrice complète figure en **§8**.

**Accessibilité du document.** Conformément à l'exigence d'accessibilité des livrables eux-mêmes, ce
document respecte une **hiérarchie de titres régulière**, des **tableaux à en-têtes explicites** et
des **intitulés de liens signifiants** ; tout schéma sera accompagné d'une **alternative textuelle**.

### 1.5 Structure du document

Le cahier des charges s'organise en huit sections continues :

1. **Introduction** *(section courante)* — objet, contexte, périmètre, démarche et conventions.
2. **Profils utilisateurs et accessibilité** — personas client et agent de support (tchat), prise en
   compte des personnes en situation de handicap (PSH).
3. **Exigences fonctionnelles — Authentification et profil**.
4. **Exigences fonctionnelles — Recherche, réservation et paiement**.
5. **Usages du personnel et intégration des applications d'agence**.
6. **Exigences fonctionnelles — Support client en temps réel (tchat)**.
7. **Exigences transverses (non fonctionnelles)** — accessibilité, internationalisation, sécurité,
   RGPD, écoconception.
8. **Traçabilité, hypothèses et couverture** — matrice besoins → user stories, renvoi au registre des
   décisions, couverture du périmètre fonctionnel.
