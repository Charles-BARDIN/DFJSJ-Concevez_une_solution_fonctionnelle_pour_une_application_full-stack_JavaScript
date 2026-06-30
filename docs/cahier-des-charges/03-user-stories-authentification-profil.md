## 3. Exigences fonctionnelles — Authentification et profil

Cette section couvre le **cycle de vie du compte** (authentification) et la **gestion du profil**,
pour le profil **Client** défini en §2. Le **contrôle d'accès par rôle (RBAC)** distingue le
**client** et l'**agent de support** (tchat, §6) ; l'accès des applications d'agence tierces à l'API
est authentifié séparément (dans la proposition d'architecture). Conformément à **ADR-002**, l'authentification repose sur
**e-mail + mot de passe** (sans 2FA/SSO — évolution possible).

Les mécanismes techniques sous-jacents — **hachage des mots de passe, émission et
validation des jetons, envoi des e-mails, transport sécurisé** — relèvent de l'architecture et
des **exigences de sécurité (§7)** ; ils ne sont pas spécifiés au niveau fonctionnel ici.

*Convention (rappel §1.4) : chaque user story précise sa priorité (MoSCoW), ses critères
d'acceptation et ses **étiquettes d'accessibilité** (§2.3). Source : « v0 » = explicite ;
« implicite v0 » = supposé par le v0 et consolidé ; « [HYP] » = hypothèse tracée.*

### 3.1 Authentification

**US-AUTH-01 — Inscription** · *Must* · *implicite v0 → ADR-002*
> En tant que **visiteur**, je veux **créer un compte avec mon e-mail et un mot de passe**, afin de **réserver et gérer mes locations**.

- Étant donné un e-mail non enregistré, quand je soumets le formulaire avec un mot de passe conforme à la politique affichée, alors un compte « non vérifié » est créé et un e-mail de vérification est envoyé.
- Étant donné un e-mail déjà associé à un compte, quand je soumets, alors l'inscription est refusée avec un message clair.
- La **politique de mot de passe** (longueur, robustesse) est affichée ; chaque erreur de saisie est identifiée et explicite.
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-CLAVIER`, `A11Y-NOM-ROLE`.

**US-AUTH-02 — Vérification de l'e-mail** · *Must* · *ADR-002*
> En tant que **client nouvellement inscrit**, je veux **confirmer mon adresse e-mail**, afin de **valider mon compte et sécuriser mon identité**.

- Étant donné un compte « non vérifié », quand j'active le lien de vérification reçu, alors le compte passe à « vérifié ».
- Étant donné un lien expiré ou invalide, quand je l'active, alors un message clair me permet de **redemander** un e-mail de vérification.
- L'e-mail est envoyé dans la **langue** de l'utilisateur (i18n, §7).
- **Accessibilité** : `A11Y-LANGUE`, `A11Y-NOM-ROLE` (retour de statut annoncé).

**US-AUTH-03 — Connexion** · *Must* · *implicite v0 → ADR-002*
> En tant que **client**, je veux **me connecter avec mon e-mail et mon mot de passe**, afin d'**accéder à mon espace**.

- Étant donné des identifiants valides, quand je me connecte, alors j'accède à mon espace ; le **rôle** (client / agent de support) détermine les accès (RBAC, ADR-002).
- Étant donné des identifiants invalides, quand je me connecte, alors un **message neutre** s'affiche (sans indiquer quel champ est erroné).
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-CLAVIER`, `A11Y-NOM-ROLE`.

**US-AUTH-04 — Déconnexion** · *Must* · *ADR-002*
> En tant que **client connecté**, je veux **me déconnecter**, afin de **protéger mon compte sur un appareil partagé**.

- Quand je me déconnecte, alors ma session est invalidée et je reviens à un état non authentifié.
- **Accessibilité** : `A11Y-CLAVIER`, `A11Y-NOM-ROLE`.

**US-AUTH-05 — Réinitialisation du mot de passe** · *Must* · *ADR-002*
> En tant que **client ayant oublié son mot de passe**, je veux **le réinitialiser depuis mon e-mail**, afin de **récupérer l'accès à mon compte**.

- Étant donné une demande de réinitialisation, quand je saisis mon e-mail, alors un **message neutre** confirme l'envoi d'un lien si le compte existe (anti-énumération).
- Étant donné un lien valide, quand je définis un nouveau mot de passe conforme, alors il remplace l'ancien et les **sessions existantes sont invalidées**.
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-CLAVIER`, `A11Y-LANGUE`.

### 3.2 Profil

**US-PROF-01 — Consulter son profil** · *Must* · *v0*
> En tant que **client**, je veux **consulter mon profil**, afin de **vérifier mes informations personnelles**.

- Quand j'ouvre ma page de profil, alors mes informations (nom, prénom, date de naissance, adresse) et mon e-mail sont affichés.
- **Accessibilité** : `A11Y-STRUCTURE`, `A11Y-CLAVIER`.

**US-PROF-02 — Modifier ses informations personnelles** · *Must* · *v0*
> En tant que **client**, je veux **modifier mes informations personnelles** (nom, prénom, date de naissance, adresse), afin de **les garder à jour**.

- Étant donné des valeurs valides, quand j'enregistre, alors les informations sont mises à jour et une confirmation est annoncée.
- Étant donné une valeur invalide (ex. date de naissance incohérente), quand j'enregistre, alors l'erreur est identifiée et une correction est suggérée.
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-CLAVIER`, `A11Y-NOM-ROLE`.

**US-PROF-03 — Supprimer son compte** · *Must* · *v0 + ADR-010 (RGPD)*
> En tant que **client**, je veux **supprimer mon compte en confirmant mon mot de passe**, afin d'**exercer mon droit à l'effacement**.

- Étant donné un client connecté, quand il demande la suppression, **saisit son mot de passe** (exigé par le v0) puis confirme l'action **irréversible**, alors le compte est supprimé.
- Les **données personnelles** sont **effacées ou anonymisées** ; les **données transactionnelles** soumises à obligation légale (réservations, facturation) sont **conservées sous forme anonymisée** (RGPD — **ADR-010**, détaillé en §7).
- Un **récapitulatif des conséquences** est présenté avant confirmation, en **langage clair**.
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-LANGUE`, `A11Y-CLAVIER`, `A11Y-DELAIS`.

**US-PROF-04 — Exporter ses données personnelles** · *Should* · *[HYP] ADR-016 (droit d'accès / portabilité RGPD)*
> En tant que **client**, je veux **exporter mes données personnelles dans un format réutilisable**, afin d'**exercer mon droit d'accès et de portabilité (RGPD)**.

- Étant donné un client connecté, quand il demande l'export, alors le système génère une **copie de l'ensemble de ses données personnelles** dans un **format structuré et lisible par machine** (réutilisable).
- L'export couvre les données du **profil** et les **réservations** rattachées au client.
- **Accessibilité** : `A11Y-FORMULAIRES`, `A11Y-CLAVIER`, `A11Y-NOM-ROLE` (statut de génération annoncé), `A11Y-LANGUE`.

### 3.3 Liens transverses
- **Sécurité** (hachage, jetons, anti-énumération, transport chiffré) et **RGPD** (droit à l'effacement, minimisation) : exigences détaillées en **§7** ; sémantique de la suppression de compte en **ADR-010**.
- Les **informations personnelles** réutilisées lors d'une réservation (§4) sont récupérées depuis le profil quand elles existent (v0).
