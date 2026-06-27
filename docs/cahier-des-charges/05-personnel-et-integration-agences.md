## 5. Usages du personnel et intégration des applications d'agence

Le v0 **exclut explicitement** « les actions que les employés font en agence » du périmètre de
l'application et demande seulement une **API** pour les **applications d'agence existantes**. Le
présent système ne comporte donc **ni application back-office ni user story de gestion** : les usages
du personnel se résument à deux points.

### 5.1 API CRUD pour les applications d'agence tierces

Le système expose une **API CRUD par domaine** (utilisateur, réservation, offre, agence…) consommée
par des **applications d'agence tierces** (exigence du v0). Ces applications sont des **composants
tiers à intégrer**, **conçus et modélisés au Stade 3** (intégration des composants tiers, **C.1.7**) :
**aucun écran ni user story** n'est spécifié ici.

- Les opérations d'**administration** (créer / modifier des offres et des agences, gérer les
  réservations) sont réalisées via cette API par les **applications d'agence** — **hors périmètre**
  de notre application.
- La **clôture d'une réservation** (transition *confirmée → terminée*) est déclenchée par une
  application d'agence via l'API, **au retour du véhicule** ; la **machine à états** (incluant
  *terminée* et *no-show*) est formalisée au **Stade 3** — voir **ADR-014** (registre des décisions).

### 5.2 Agent de support (pendant du client dans le tchat)

Le **seul usage « personnel » dans le périmètre** est l'**agent de support**, **participant du
tchat** : il est le pendant du **client** dans l'échange temps réel. Ses besoins et critères
d'acceptation figurent au **§6** (US-CHAT-02) ; aucune autre capacité ne lui est attribuée dans notre
système. L'accessibilité de l'interface de tchat s'applique aussi à lui (persona P6, §2).
