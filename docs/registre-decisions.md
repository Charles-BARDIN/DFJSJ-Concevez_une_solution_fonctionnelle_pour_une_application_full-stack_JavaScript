# Registre des décisions (ADR) — Your Car Your Way (Option B)

Ce registre rassemble les **décisions structurantes** du projet — fonctionnelles et techniques — au
format **ADR** (*Architecture Decision Record*). Il est **transverse** au cahier des charges
(livrable 1) et à la proposition d'architecture (livrable 2) : les deux documents y renvoient par le
**numéro d'ADR**.

Chaque décision suit la même trame : **Contexte / Décision / Alternatives écartées / Conséquences**
(certaines ajoutent « *Ce que dit le v0* » quand la source mérite d'être citée).

**Légende — [HYP].** La mention **[HYP]** signale une **hypothèse** : un point laissé ouvert par le
cahier des charges initial (v0), tranché ici par une décision raisonnable et défendable, faute
d'interlocuteur métier disponible. Les ADR sans cette mention consolident un besoin déjà présent
dans les sources.

---

## ADR-000 — Méthode : combler les manques du v0 par des hypothèses tracées
**Contexte.** Le cahier des charges initial (v0) est explicitement incomplet et plusieurs points
restent ouverts, sans interlocuteur métier pour les arbitrer.
**Décision.** Toute question ouverte est résolue par une **hypothèse raisonnable, décidée et tracée**
dans ce registre, formulée sobrement et défendable. On ne reste jamais bloqué sur une question
ouverte.
**Alternatives écartées.** Laisser des questions « à valider » en suspens → non livrable dans ce
contexte.
**Conséquences.** Les ADR ci-dessous matérialisent ces hypothèses et décisions.

## ADR-001 — Périmètre : application client + API pour applications d'agence tierces + tchat
**Contexte.** Le v0 décrit une **application client** et **exclut explicitement** « les actions que
les employés font en agence » ; il demande seulement une **API** pour les **applications d'agence
existantes**. La grille d'autoévaluation ne mentionne aucun back-office et range l'agence dans
l'**intégration de composants tiers** (C.1.7).
**Décision.** Le système est composé de **(a)** une **application client** (le produit), **(b)** une
**API CRUD par domaine** exposée à des **applications d'agence tierces** (composants tiers à
intégrer, modélisés dans la proposition d'architecture), et **(c)** un **tchat** dont l'un des participants est un **agent de
support**. L'usage « employé » existe **uniquement** comme **agent du tchat** (§6) et comme
**consommateur de l'API**. **Pas de seconde application**, pas de back-office, pas de user stories de
gestion.
**Alternatives écartées.** Concevoir « deux surfaces » (application client + application back-office)
→ **contredit l'exclusion explicite du v0** et invente une application non demandée ; l'autoévaluation
range l'agence en **composant tiers**, pas en surface applicative.
**Conséquences.** Cadre le périmètre (§1.3), les profils (§2, pas de rôle de gestion), les usages du
personnel et l'intégration des apps d'agence (§5) et le tchat (§6). L'administration (offres, agences,
réservations) est réalisée par les applications d'agence via l'API.

## ADR-002 — Authentification : e-mail / mot de passe + contrôle d'accès par rôle (RBAC)
**Contexte.** Le v0 ne décrit pas l'authentification mais la présuppose (profil, suppression de
compte avec mot de passe). Le périmètre comporte un **client** et un **agent de support** (tchat),
d'où des niveaux d'accès distincts.
**Décision.** **E-mail / mot de passe** : inscription, connexion, déconnexion, **vérification
e-mail**, **réinitialisation**. **Contrôle d'accès par rôle (RBAC)** : **client vs agent de support**.
**Alternatives écartées.** **2FA / SSO** → valeur réelle mais hors cadrage ; mentionnés comme
**évolution possible**. Authentification sociale → complexité sans bénéfice métier ici.
**Conséquences.** La stack d'identité est spécifiée à l'architecture ; elle est **stubée** dans la
preuve de concept (cf. ADR-006).

## ADR-003 — Architecture cible : monolithe modulaire + module temps réel séparable
**Contexte.** L'existant : monolithes hétérogènes, bases divergentes, partage d'information
inexistant. Les difficultés portent sur la **cohérence** et la **maintenabilité**, **pas sur la
charge** (150–350 req/s, modeste).
**Décision.** **Monolithe modulaire** (modules métier délimités, base unifiée, API unique).
**Exception** : le **tchat / temps réel** (connexions WebSocket longues, *stateful*, profil d'exécution
distinct) est modélisé comme **module séparable** — une **passerelle temps réel extractible** — sans
découper le reste.
**Alternatives écartées.** **Microservices** → répondent à des contraintes de charge / organisation
que l'audit ne révèle pas ; sur-ingénierie au regard du cadrage et de la volumétrie. **Monolithe non
modulaire** → reproduit la dette de cohérence de l'existant.
**Conséquences.** Cible sobre, justifiée par l'audit ; le module temps réel pourra être extrait si la
charge WebSocket l'exige.

## ADR-004 — Exigences transverses retenues : accessibilité, i18n, RGPD, écoconception
**Contexte.** Le v0 ne mentionne aucune exigence transverse, mais l'énoncé et l'autoévaluation les
exigent (accessibilité des personnes en situation de handicap centrale, international, conformité,
impact écologique).
**Décision.** Intégrer **les quatre comme exigences à part entière, au niveau cadrage** :
**accessibilité (RGAA / WCAG 2.1 AA)** — la plus pondérée (critères d'accessibilité par user story ;
livrables eux-mêmes accessibles) ; **internationalisation** (langues, devises, fuseaux horaires) ;
**RGPD** ; **écoconception**.
**Alternatives écartées.** Les traiter en annexe « best effort » → sous-pondère l'accessibilité,
attendue comme exigence première.
**Conséquences.** Exigences non fonctionnelles + critères d'acceptation **ciblés** (non exhaustifs)
dans le cahier des charges et l'architecture.

## ADR-005 — Harness de démonstration du PoC : pages HTML nues
**Contexte.** Il faut **démontrer une connexion temps réel en direct**, sans transformer la preuve de
concept en application ni en interface produit.
**Décision.** Un **harness HTML nu** à deux entrées (**Customer** + **Agent**) : un champ de saisie +
une liste de messages, **WebSocket brut**, **sans framework / CSS / routeur / logique produit**. C'est
un harness de démonstration, **jamais** une interface applicative.
**Alternatives écartées.** **Ligne de commande (CLI)** → suffit aux tests mais démontre mal le trajet
navigateur ↔ WebSocket et les deux côtés Customer / Agent. **Front à framework (Angular / React)** →
contredit « structure technique plutôt qu'interface » et alourdit la preuve de concept.
**Conséquences.** La **preuve** reste les tests d'intégration (cf. ADR-006) ; le harness ne sert que
la démonstration visuelle.

## ADR-006 — Périmètre de sécurité du PoC : authentification + autorisation + isolation démontrées
**Contexte.** Le tchat doit prouver sa **sécurité propre** sans réimplémenter la plateforme
d'identité (hors périmètre de la preuve de concept).
**Décision.** La preuve de concept **démontre**, par tests d'intégration : **handshake WebSocket
authentifié** (jeton signé validé à la connexion ; jeton absent / invalide rejeté), **liaison
identité / rôle** (Customer vs Agent dérivés du jeton), **isolation de conversation**. Sont **stubés
dans la PoC et spécifiés uniquement à l'architecture** : hachage (argon2id), émission / refresh des
jetons, vérification e-mail, gestion des secrets, wss/TLS. La PoC consomme un **jeton de test forgé
par un helper « stub du service d'identité »**.
**Alternatives écartées.** Réimplémenter la stack d'identité dans la PoC → hors périmètre, brouille la
preuve. Ne rien sécuriser → ne prouve pas la viabilité du tchat (handshake et isolation sont au cœur
de l'architecture temps réel).
**Conséquences.** Frontière nette preuve de concept ↔ architecture ; preuve reproductible.

## ADR-007 — Nommage des livrables : auteur, fichiers PDF, date de démarrage
**Contexte.** Le nommage impose `Nom_Prenom_Option_B_N_nom_livrable_MMYYYY` avec la « date de
démarrage du projet ». Projet démarré en **juin 2026**. Deux formes coexistent : l'identité **dans le
contenu** des documents et l'identité **dans les noms de fichiers**.
**Décision.** **Date** = **062026** ; **noms de fichiers PDF** = `Bardin_Charles_Option_B_N_nom_livrable_062026` ;
**auteur dans le contenu** (bloc auteur, page de garde) = **Simon Charles Paul Bardin** (état civil
complet).
**Alternatives écartées.** `012026` (exemple générique de l'énoncé) → ne correspond pas au démarrage
réel. `Bardin_SimonCharles` dans les noms de fichiers → remplacé par `Bardin_Charles`.
**Conséquences.** Appliqué à l'export PDF et à tout bloc auteur des livrables.

## ADR-008 — Granularité des offres : niveau catégorie ACRISS ; pas de gestion du parc à l'unité
**Contexte.** Le v0 définit une offre par ville de départ / retour, dates, **catégorie de véhicule
(norme ACRISS)** et tarif — jamais par véhicule précis. La gestion physique du parc (inventaire,
affectation, maintenance) relève de l'exploitation en agence.
**Décision.** Offres et réservations sont modélisées au **niveau catégorie ACRISS**. La **gestion du
parc à l'unité est hors périmètre** (périmètre : application client) ; la disponibilité est traitée au
niveau **catégorie / agence / période**.
**Alternatives écartées.** Modéliser chaque véhicule unitaire → complexité d'inventaire non demandée
par le v0, hors cadrage.
**Conséquences.** Simplifie le modèle de données ; cohérent avec le v0. Une extension « inventaire à
l'unité » reste possible (évolution).

## ADR-009 — Profils utilisateurs et niveaux d'accès
**Contexte.** Le v0 ne précise pas si la consultation (agences, recherche, offres, détail) exige un
compte — il ne dit **jamais** qu'elle est publique. Le périmètre (ADR-001) comporte une application
client et un agent de support (tchat).
**Décision.** Profils retenus :
- **Visiteur** (non authentifié) : consultation publique — liste des agences, recherche d'offres,
  détail d'une offre. *(Rendre la consultation publique est une **[HYP]** : usage courant du
  secteur ; le v0 est muet sur ce point.)*
- **Client** (authentifié) : parcours complet — compte / profil, réservation, paiement, historique,
  modification / annulation, support (tchat).
- **Agent de support** (authentifié) : **participant du tchat** (§6), pendant du client.
Le RBAC (ADR-002) distingue **client** et **agent de support**. **Aucun rôle de gestion** :
l'administration relève des applications d'agence tierces (API).
**Alternatives écartées.** Tout placer derrière authentification → friction inutile à la consultation.
Introduire un rôle de gestion (« gestionnaire ») → supposerait une application back-office hors
périmètre (ADR-001).
**Conséquences.** Cadre les profils (§2.1) ; cohérent avec ADR-001.

## ADR-010 — Suppression de compte : effacement des données personnelles + conservation légale anonymisée
**Contexte.** Le v0 exige la suppression de compte (avec saisie du mot de passe). Le RGPD ouvre un
**droit à l'effacement**, mais des obligations légales (comptabilité, facturation) imposent de
**conserver** certaines données transactionnelles. Un effacement total brut entrerait en conflit avec
ces obligations.
**Décision.** La suppression **efface ou anonymise les données personnelles** du client et **conserve
les données transactionnelles** nécessaires (réservations, facturation) sous **forme anonymisée**,
pour la durée légale requise. La **saisie du mot de passe** (v0) et une **confirmation explicite**
protègent l'action irréversible.
**Alternatives écartées.** Effacement total immédiat → non conforme aux obligations de conservation.
Conservation intégrale → contraire à la minimisation et au droit à l'effacement.
**Conséquences.** À détailler en §7 (RGPD) et dans le modèle de données (séparation données
personnelles / transactionnelles). Cohérent avec US-PROF-03.

## ADR-011 — Politique de modification / annulation / remboursement
**Contexte.** La réservation est modifiable et annulable (v0) ; il faut une politique complète et sans
zone grise pour les règles métier (§4) et la machine à états de réservation. Référence temporelle =
**date / heure de début** (prise du véhicule).
**Ce que dit le v0.** Modification possible **jusqu'à 48 h** avant le début ; « à **moins d'une
semaine** du début, remboursement de **25 %** seulement ». Rien sur l'annulation au-delà d'une semaine
ni sur le dernier moment (< 48 h).
**Options envisagées.** **Option A** — fidélité stricte au v0 : 25 % sur tout « < 1 semaine », y
compris < 48 h. **Option B (retenue)** — réalisme métier : palier supplémentaire **< 48 h / no-show à
0 %**, en lisant « moins d'une semaine » comme le créneau [1 semaine – 48 h].
**Décision : Option B.** Matrice retenue :

| Créneau avant le début | Modification | Annulation — remboursement |
|---|---|---|
| > 1 semaine | Autorisée | 100 % |
| ≤ 1 semaine et > 48 h | Autorisée | 25 % (v0) |
| ≤ 48 h (no-show) | Refusée | 0 % |

**Justification.** (1) **Cohérence interne** : la modification est déjà refusée à ≤ 48 h (v0) ;
rembourser 25 % alors qu'aucune modification n'est possible serait incohérent. (2) **Usage du
secteur** : le dernier moment est traité comme un no-show non remboursé. (3) **Non-contradiction** :
le v0 fixe la pénalité « dans la semaine » sans expliciter les dernières 48 h. L'Option A reste
possible si l'on privilégie la lettre stricte du v0.
**Conséquences.** Une **modification qui change le tarif** est un cas à part entière (§4) : le
**complément** (hausse) ou le **remboursement partiel** (baisse) transite par le **prestataire de
paiement externe**, confirmé par **webhook** (US-LOC-06). Alimente la machine à états de réservation.

## ADR-012 — Relation agence / ville / offre
**Contexte.** Conditionne le modèle de données et les user stories de recherche / réservation (§4).
**Ce que dit le v0.** « Consulter la liste des agences » ; recherche par ville de départ / retour ;
offre définie par villes, dates, catégorie ACRISS, tarif — sans relier explicitement offre et agence.
**Décision.** **Ville** : référentiel géographique. **Agence** : appartient à une ville (1 ville →
0..n agences) ; **point physique de retrait / retour**. **Offre** : rattachée à une **agence de
retrait** et une **agence de retour** (différentes possibles → aller simple), une période, une
catégorie ACRISS, un tarif ; ses villes sont **dérivées** de celles des agences. **Recherche** par
ville (v0) → résolution vers les **agences** de ces villes → offres.
**Alternatives écartées.** Offre rattachée directement aux villes (lieu de retrait indéterminé, liste
d'agences décorative) ; 1 ville = 1 agence (irréaliste).
**Conséquences.** Le modèle doit **relier explicitement** « recherche par ville → agences de la ville
→ offres » : aucun trou entre la ville cherchée et l'agence de retrait / retour. Base de l'entité
Ville–Agence–Offre.

## ADR-013 — Champs « informations personnelles » de la réservation
**Contexte.** Le v0 demande de fournir ses informations personnelles (pré-remplies depuis le profil
si présentes) ; définir lesquelles sans sur-spécifier.
**Ce que dit le v0.** Profil = nom, prénom, date de naissance, adresse. Réservation = « informations
personnelles » + paiement. Pas de mention du permis ni de l'âge.
**Décision.** **Repris du profil** (pré-remplis si présents — v0) : nom, prénom, date de naissance,
adresse, e-mail. **Spécifique location [HYP]** : **numéro de permis de conduire** (+ pays de
délivrance) ; **respect d'un âge minimal du conducteur**. Le **numéro de permis est une donnée
personnelle réglementée** → soumis à la **minimisation et à la conservation RGPD** (ADR-010, §7).
L'**âge minimal est paramétrable** (peut varier selon la catégorie ACRISS et le pays) ; les barèmes
fins sont renvoyés en **évolution**. Hors v1 (évolution) : assurances, options, conducteur additionnel.
**Alternatives écartées.** Se limiter aux 4 champs du profil (irréaliste, pas de permis) ; spécifier
finement (catégories de permis, assurances, conducteurs additionnels) → sur-ingénierie.

## ADR-014 — Clôture de réservation (confirmée → terminée) via l'API, au retour du véhicule
**Contexte.** L'état « terminée » figure dans le cycle de vie mais aucune user story ne décrivait la
transition **confirmée → terminée**.
**Décision.** La clôture est déclenchée **au retour du véhicule en agence**, **via l'API**, par une
**application d'agence tierce** (et non par une application back-office, absente du périmètre). La
**machine à états** est formalisée à l'architecture.
**Alternatives écartées.** Une user story de clôture « back-office » → suppose une application de
gestion absente du périmètre (le v0 exclut les actions des employés ; l'administration passe par les
apps d'agence). Une transition purement automatique à la date de fin → ignore retards et retours
anticipés.
**Conséquences.** Décrite en §5 (intégration des apps d'agence) ; cohérente avec ADR-001 et la machine
à états (architecture).

## ADR-015 — Tchat de support temps réel : ajout au périmètre v0 (hypothèse)
**Contexte.** Le tchat est **imposé comme sujet de la preuve de concept** (énoncé étape 4 +
autoévaluation C.1.5) mais **absent du cahier des charges v0**. Il faut un ancrage métier pour ne pas
l'introduire « hors-sol ».
**Décision.** Le besoin « **support / assistance client en temps réel** » est **ajouté au périmètre
fonctionnel comme [HYP]** (US-CHAT-01, §6), justifié par un besoin métier réel **et par
l'accessibilité** : la persona **P4 (cliente sourde)** est exclue du support téléphonique → le **canal
texte temps réel est inclusif**. Le tchat valide la **brique temps réel** de l'architecture cible
(module séparable, ADR-003) et fait l'objet de la **preuve de concept**.
**Alternatives écartées.** Traiter le tchat seulement comme artefact de PoC sans besoin métier →
fonctionnalité hors-sol, non traçable. Support uniquement e-mail / téléphone → exclut les personnes
sourdes / malentendantes et ne valide pas la brique temps réel.
**Conséquences.** US-CHAT-01 / US-CHAT-02 (§6) ; périmètre PoC strict (Customer + Agent, handshake
authentifié, isolation) ; cohérent avec ADR-003.

## ADR-016 — Export des données personnelles en self-service (droit d'accès / portabilité RGPD)
**Contexte.** Le RGPD garantit au client un **droit d'accès** (art. 15) et un **droit à la portabilité**
(art. 20) : obtenir une copie de ses données dans un format réutilisable. Le v0 n'en parle pas, et
« consulter son profil » (US-PROF-01) **ne couvre pas** cette obligation, qui porte sur **l'ensemble**
des données, sous forme **exportable**.
**Décision.** Exposer un **export self-service** des données personnelles du client, dans un **format
structuré et lisible par machine**, via une user story dédiée (**US-PROF-04**, §3.2) ; priorité
**Should** en v1.
**Alternatives écartées.** Rattacher le droit d'accès à « consulter son profil » → incorrect (le profil
n'est ni l'ensemble des données, ni un export). Traitement **manuel** uniquement (sur demande, hors
application) → admissible mais moins traçable et moins inclusif ; conservé comme repli si le
self-service n'est pas livré en v1.
**Conséquences.** US-PROF-04 (§3.2) ; NFR-RGPD-07 (§7) rattaché à cette US ; tracé en §8.2 / §8.3.

## ADR-017 — Cibles de niveau de service (SLO) de la plateforme cible **[HYP]**
**Contexte.** Le v0 ne fixe **aucune cible de niveau de service** ; l'audit fournit en revanche une
**baseline mesurée** que toute cible doit honorer sans rien inventer. Trois faits cadrent la décision :
la **charge n'est pas le problème** (`AUD-04`, 150 → 350 req/s soutenus partout) ; la **disponibilité
annuelle** s'étage de **97,2 %** (FR/DE/ES/IT) à **98,9 %** (US) (`AUD-08`) ; la **fiabilité de
livraison et de reprise** est le vrai point faible — MTTR ≈ 2 h 45 / ≈ 1 h 10 (`AUD-08`), réussite de
déploiement 82 % / 91 % et stabilisation 3,4 j / 1,7 j (`AUD-07`), taux d'erreur en pic 0,8 → 4 %
(`AUD-05`).
**Divergence de mesure assumée.** La source donne **deux indicateurs de disponibilité non
réconciliés** (cf. **note §2.1** de l'audit) : l'**annuel** (`AUD-08`, 97,2 → 98,9 %) implique
plusieurs heures d'indisponibilité par mois ; le **mensuel** (`AUD-14`, 7 → 28 min) une disponibilité
de l'ordre de **99,9 % ou plus**. Par **convention SLA**, la cible de disponibilité est **ancrée sur la
base annuelle** ; ce choix est **explicité** plutôt que masqué — même posture d'honnêteté que la
réserve de latence ci-dessous.
**Options envisagées.** **Option A** — aligner sur le meilleur actuel (dispo 98,9 %, MTTR ≤ 1 h 10,
déploiement ≥ 91 %) : reproduit le meilleur observé sans créditer les corrections structurelles.
**Option B (retenue)** — meilleur relevé assorti de **planchers sobres**. **Option C** — haute
disponibilité (≥ 99,95 %, multi-région) : non étayée par la volumétrie.
**Décision : Option B.** Cibles posées comme **SLO internes** (le périmètre exercice n'a pas de SLA
contractuel externe ; un SLA s'alignerait sur ces SLO) :

| SLO | Valeur | Ancrage / justification |
|---|---|---|
| **Disponibilité (base annuelle)** | **≥ 99,9 %/an** (plancher délibéré) | Cible **ancrée sur l'annuel** (`AUD-08`). Ce n'est **pas** une promesse d'amélioration : contre le **mensuel** (`AUD-14`, ~99,99 %) elle reste **en deçà**. Pris au pied de la lettre, le mensuel imposerait du **4-nines** que la volumétrie (`AUD-04`) ne justifie pas ; ancrer l'annuel avec un plancher sobre est le seul choix cohérent avec l'**anti-sur-ingénierie** (ADR-003) |
| **MTTR** | **≤ 1 h** | Aligne le parc sur le meilleur cloud ~1 h 10 (`AUD-08`), amélioré par redondance + runbook de reprise |
| **Réussite de déploiement** | **≥ 95 %** | Au-dessus de 91 % (`AUD-07`), crédible via **CI/CD automatisée** remplaçant le déploiement manuel |
| **Stabilisation post-release** | **≤ 1 j** | Sous le meilleur actuel 1,7 j (`AUD-07`), via tests automatisés en CI |
| **Taux d'erreur en pic** | **≤ 1 %** | Relève le pire 4 % vers le meilleur 0,8 % (`AUD-05`) |
| **Capacité sans dégradation** | **≥ 350 req/s en plancher** + mise à l'échelle **horizontale** | Unifier les applications régionales porte la **somme** des charges, pas le **max** d'une seule (350 = plafond d'**une** app US, `AUD-04`). La cible pose 350 en **plancher** et **scale horizontalement** (élasticité) plutôt qu'en boîte fixe plus grosse → répond à l'**agrégation** sans sur-dimensionner |

**Réserve — latence.** L'audit **ne mesure pas** le temps de réponse ; **aucune cible p95 chiffrée**
n'est posée (elle serait sans baseline). Objectif à **instrumenter** une fois la plateforme en place.
**Alternatives écartées.** **Option A** — n'inscrit aucun progrès alors que la cible corrige
précisément les causes (`AUD-07`, `AUD-15`). **Option C (4-nines / multi-région)** — **sur-ingénierie**
au regard de la volumétrie (`AUD-04`) et de la criticité du service ; contraire à ADR-003.
**Conséquences.** Ces SLO deviennent des **NFR mesurables** au chapitre des spécifications techniques
(disponibilité, MTTR, fiabilité de livraison, taux d'erreur, capacité) et **orientent** le déploiement
(redondance) et les bonnes pratiques (CI/CD, restauration éprouvée). Ils **ferment côté cible** le grief
de fiabilité de l'audit (`AUD-07` / `AUD-08` / `AUD-09`).
