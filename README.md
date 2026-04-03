# Systeme Web de Gestion Logistique - Nutrisud Alfa

Application web full-stack de gestion logistique pour Nutrisud Alfa.
- **Backend** : Laravel 11 (PHP 8.3) + Laravel Sanctum
- **Frontend** : React.js (Vite)
- **Base de donnees** : MySQL via Laragon

---

## Prerequis

- [Laragon](https://laragon.org/) installe (Full ou Standard)
- Laragon version testee : PHP 8.3.30, MySQL 8.4.3, Node v22

---

## Installation

### 1. Configurer le PATH (une seule fois par terminal PowerShell)

Ouvrir PowerShell et coller :

```powershell
$env:PATH = "C:\laragon\bin\php\php-8.3.30-Win32-vs16-x64;C:\laragon\bin\composer;C:\laragon\bin\nodejs\node-v22;C:\laragon\bin\git\bin;" + $env:PATH
Set-ExecutionPolicy RemoteSigned -Scope Process
```

> **Note** : Cette commande est temporaire. La relancer a chaque nouvel onglet PowerShell.

### 2. Demarrer Laragon

Ouvrir Laragon et cliquer sur **Start All** (Apache/Nginx + MySQL doivent etre verts).

### 3. Creer la base de donnees

```powershell
& "C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS nutrisud_alfa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 4. Configurer le backend

```powershell
cd "D:\projet pfe\backend"
```

Verifier que `.env` contient :
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nutrisud_alfa
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Executer les migrations et le seeder

```powershell
php artisan migrate:fresh --seed
```

### 6. Publier la config Sanctum (si pas encore fait)

```powershell
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan config:clear
```

---

## Demarrage

### Backend (API Laravel)

```powershell
cd "D:\projet pfe\backend"
php artisan serve
```

L'API sera disponible sur : http://localhost:8000

### Frontend (React + Vite)

Dans un autre terminal PowerShell (avec le PATH configure) :

```powershell
cd "D:\projet pfe\frontend"
npm run dev
```

L'application sera disponible sur : http://localhost:5173

---

## Comptes de demonstration

| Role           | Email                      | Mot de passe |
|----------------|----------------------------|--------------|
| Administrateur | salahmoetez2@gmail.com     | password     |
| Usine          | usine1@nutrisud.tn         | password     |
| Centre elevage | centre1@elevage-sfax.tn    | password     |
| Transport      | transport@translog.tn      | password     |
| Chauffeur      | chauffeur1@translog.tn     | password     |

D'autres comptes usine disponibles : usine2 a usine5 (@nutrisud.tn)
D'autres comptes centre : centre2 et centre3 (@elevage-sfax.tn)
Chauffeur 2 : chauffeur2@translog.tn

---

## Fonctionnalites par role

### Administrateur
- Tableau de bord global (statistiques, graphiques)
- Gestion des utilisateurs (CRUD complet)
- Gestion des entites (societes aliment/elevage/transport, centres)
- Export des rapports en Excel et PDF

### Responsable Usine
- Dashboard usine (commandes recentes, stats)
- Gestion des produits alimentaires (CRUD)
- Suivi et gestion du stock de l'usine (ajout/retrait avec alerte)
- Traitement des commandes (valider, mettre en cours, refuser)

### Responsable Centre d'elevage
- Dashboard centre
- Passer des commandes, les annuler
- Suivi du stock du centre

### Responsable Transport
- Dashboard transport
- Planifier les livraisons depuis les commandes confirmees
- Affecter camion et chauffeur
- Gestion de la flotte (camions et chauffeurs CRUD)

### Chauffeur
- Voir ses livraisons assignees
- Demarrer une livraison (en_cours)
- Marquer une livraison comme livree

---

## Architecture du projet

```
projet pfe/
├── backend/                  (Laravel 11)
│   ├── app/Http/Controllers/Api/   (11 controllers)
│   ├── app/Http/Middleware/CheckRole.php
│   ├── app/Models/           (13 modeles Eloquent)
│   ├── app/Exports/RapportExport.php
│   ├── database/migrations/  (8 fichiers)
│   ├── database/seeders/DatabaseSeeder.php
│   ├── resources/views/reports/commandes.blade.php
│   └── routes/api.php
└── frontend/                 (React + Vite)
    └── src/
        ├── components/       (Layout, ProtectedRoute)
        ├── context/AuthContext.jsx
        ├── services/api.js
        └── pages/
            ├── admin/        (Dashboard, Users, Rapports, Entites)
            ├── usine/        (Dashboard, Produits, StockUsine, CommandesUsine)
            ├── centre/       (CentreDashboard, CommandesCentre, StockCentre)
            ├── transport/    (TransportDashboard, Livraisons, Camions, Chauffeurs)
            └── chauffeur/    (ChauffeurDashboard)
```

---

## Workflow metier

```
Centre passe commande (nouvelle)
    → Usine traite (en_cours)
    → Usine confirme (confirmee) [stock deduit automatiquement]
    → Transport planifie livraison (planifiee)
    → Transport affecte camion + chauffeur
    → Chauffeur demarre (en_cours)
    → Chauffeur livre (livree) [stock centre mis a jour]
```

---

## Technologies

| Couche        | Technologie                              |
|---------------|------------------------------------------|
| Backend       | Laravel 11, PHP 8.3, Sanctum             |
| Export        | maatwebsite/excel 3.1, barryvdh/dompdf   |
| Frontend      | React 18, Vite, react-router-dom, axios  |
| Base de donnees | MySQL 8.4 (Laragon)                    |
| Authentification | Token Bearer (Sanctum)               |
