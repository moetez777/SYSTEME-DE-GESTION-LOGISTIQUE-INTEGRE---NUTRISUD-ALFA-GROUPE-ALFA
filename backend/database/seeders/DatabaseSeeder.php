<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Role;
use App\Models\User;
use App\Models\SocieteAliment;
use App\Models\SocieteElevage;
use App\Models\CentreElevage;
use App\Models\SocieteTransport;
use App\Models\Camion;
use App\Models\Chauffeur;
use App\Models\Produit;
use App\Models\StockAliment;
use App\Models\StockCentre;
use App\Models\Commande;
use App\Models\Livraison;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Roles ──────────────────────────────────────────────
        $roleAdmin     = Role::create(['name' => 'admin',     'label' => 'Administrateur']);
        $roleUsine     = Role::create(['name' => 'usine',     'label' => 'Responsable Usine']);
        $roleCentre    = Role::create(['name' => 'centre',    'label' => 'Responsable Centre']);
        $roleTransport = Role::create(['name' => 'transport', 'label' => 'Responsable Transport']);
        $roleChauffeur = Role::create(['name' => 'chauffeur', 'label' => 'Chauffeur']);

        // ── 2. Admin ──────────────────────────────────────────────
        User::create([
            'name'     => 'Admin Nutrisud',
            'email'    => 'salahmoetez2@gmail.com',
            'password' => Hash::make('password'),
            'role_id'  => $roleAdmin->id,
        ]);

        // ── 3. Societes Aliment (5) ───────────────────────────────
        $societeAlimData = [
            ['nom' => 'Nutrisud Alfa Usine 1', 'adresse' => 'Route Mahdia Km 10, Sfax', 'telephone' => '+216 74 000 001', 'email' => 'usine1@nutrisud.tn',  'capacite_prod' => 50000],
            ['nom' => 'Nutrisud Alfa Usine 2', 'adresse' => 'Zone Industrielle Sfax',   'telephone' => '+216 74 000 002', 'email' => 'usine2@nutrisud.tn',  'capacite_prod' => 45000],
            ['nom' => 'Alfa Feed Tunis',        'adresse' => 'Tunis Nord ZI',            'telephone' => '+216 71 000 001', 'email' => 'alfatun@nutrisud.tn', 'capacite_prod' => 60000],
            ['nom' => 'Alfa Feed Sousse',       'adresse' => 'Sousse ZI',                'telephone' => '+216 73 000 001', 'email' => 'alfasou@nutrisud.tn', 'capacite_prod' => 40000],
            ['nom' => 'Alfa Feed Gabes',        'adresse' => 'Gabes Route El Alem',      'telephone' => '+216 75 000 001', 'email' => 'alfagab@nutrisud.tn', 'capacite_prod' => 35000],
        ];

        $societes = [];
        foreach ($societeAlimData as $i => $data) {
            $s = SocieteAliment::create($data);
            $societes[] = $s;

            User::create([
                'name'        => 'Responsable ' . $data['nom'],
                'email'       => 'usine' . ($i + 1) . '@nutrisud.tn',
                'password'    => Hash::make('password'),
                'role_id'     => $roleUsine->id,
                'entity_id'   => $s->id,
                'entity_type' => 'societe_aliment',
            ]);
        }

        // ── 4. Societe Transport ──────────────────────────────────
        $transport = SocieteTransport::create([
            'nom'      => 'TransLog Sfax',
            'adresse'  => 'Route Aeroport Sfax',
            'telephone'=> '+216 74 111 000',
            'email'    => 'contact@translog.tn',
            'flotte'   => 3,
        ]);

        User::create([
            'name'        => 'Responsable Transport',
            'email'       => 'transport@translog.tn',
            'password'    => Hash::make('password'),
            'role_id'     => $roleTransport->id,
            'entity_id'   => $transport->id,
            'entity_type' => 'societe_transport',
        ]);

        $cam1 = Camion::create(['societe_transport_id' => $transport->id, 'immatriculation' => '254TU7100', 'capacite' => 10, 'type' => 'standard']);
        $cam2 = Camion::create(['societe_transport_id' => $transport->id, 'immatriculation' => '102SF1234', 'capacite' => 15, 'type' => 'benne']);

        $chauf1 = Chauffeur::create(['societe_transport_id' => $transport->id, 'nom' => 'Ben Ali',  'prenom' => 'Mohamed', 'telephone' => '+216 55 111 001', 'permis' => 'PN001234']);
        $chauf2 = Chauffeur::create(['societe_transport_id' => $transport->id, 'nom' => 'Trabelsi', 'prenom' => 'Hichem',  'telephone' => '+216 55 111 002', 'permis' => 'PN005678']);

        $userChauf1 = User::create([
            'name'        => 'Mohamed Ben Ali',
            'email'       => 'chauffeur1@translog.tn',
            'password'    => Hash::make('password'),
            'role_id'     => $roleChauffeur->id,
            'entity_id'   => $chauf1->id,
            'entity_type' => 'chauffeur',
        ]);
        $chauf1->update(['user_id' => $userChauf1->id]);

        $userChauf2 = User::create([
            'name'        => 'Hichem Trabelsi',
            'email'       => 'chauffeur2@translog.tn',
            'password'    => Hash::make('password'),
            'role_id'     => $roleChauffeur->id,
            'entity_id'   => $chauf2->id,
            'entity_type' => 'chauffeur',
        ]);
        $chauf2->update(['user_id' => $userChauf2->id]);

        // ── 5. Societe Elevage + Centres ─────────────────────────
        $elevage = SocieteElevage::create([
            'nom'      => 'Elevage Moderne Sfax',
            'adresse'  => 'Route el Ain Sfax',
            'telephone'=> '+216 74 222 000',
            'email'    => 'contact@elevage-sfax.tn',
        ]);

        $centres = [];
        $centresData = [
            ['nom' => 'Centre Nord', 'localisation' => 'Sfax Nord',     'capacite' => 20000],
            ['nom' => 'Centre Sud',  'localisation' => 'Sfax Sud',      'capacite' => 15000],
            ['nom' => 'Centre Est',  'localisation' => 'Sfax Zone Est', 'capacite' => 18000],
        ];

        foreach ($centresData as $i => $cd) {
            $c = CentreElevage::create(array_merge($cd, ['societe_elevage_id' => $elevage->id]));
            $centres[] = $c;

            User::create([
                'name'        => 'Responsable ' . $cd['nom'],
                'email'       => 'centre' . ($i + 1) . '@elevage-sfax.tn',
                'password'    => Hash::make('password'),
                'role_id'     => $roleCentre->id,
                'entity_id'   => $c->id,
                'entity_type' => 'centre_elevage',
            ]);
        }

        // ── 6. Produits ───────────────────────────────────────────
        $produits = [
            Produit::create(['nom' => 'Aliment Demarrage', 'type' => 'demarrage', 'unite' => 'kg',  'prix_unitaire' => 1.85, 'description' => 'Pour poussins 0-10 jours']),
            Produit::create(['nom' => 'Aliment Croissance', 'type' => 'croissance','unite' => 'kg',  'prix_unitaire' => 1.70, 'description' => 'Pour poulets 11-28 jours']),
            Produit::create(['nom' => 'Aliment Finition',  'type' => 'finition',  'unite' => 'kg',  'prix_unitaire' => 1.60, 'description' => 'Pour poulets 28j a abattage']),
            Produit::create(['nom' => 'Aliment Ponte',     'type' => 'ponte',     'unite' => 'sac', 'prix_unitaire' => 28.00,'description' => 'Pour poules pondeuses (sac 25kg)']),
        ];

        // ── 7. Stocks Usine ───────────────────────────────────────
        foreach ($societes as $s) {
            foreach ($produits as $p) {
                StockAliment::create([
                    'societe_aliment_id' => $s->id,
                    'produit_id'         => $p->id,
                    'quantite_dispo'     => rand(1000, 20000),
                    'seuil_alerte'       => 500,
                    'date_maj'           => now(),
                ]);
            }
        }

        // ── 8. Stocks Centre ──────────────────────────────────────
        foreach ($centres as $c) {
            foreach ($produits as $p) {
                StockCentre::create([
                    'centre_elevage_id' => $c->id,
                    'produit_id'        => $p->id,
                    'quantite'          => rand(100, 2000),
                    'seuil_alerte'      => 100,
                    'date_maj'          => now(),
                ]);
            }
        }

        // ── 9. Commandes et Livraisons exemples ───────────────────
        $cmd1 = Commande::create([
            'centre_elevage_id'  => $centres[0]->id,
            'societe_aliment_id' => $societes[0]->id,
            'produit_id'         => $produits[0]->id,
            'quantite'           => 2000,
            'unite'              => 'kg',
            'statut'             => 'confirmee',
            'date_commande'      => now()->subDays(5),
            'date_traitement'    => now()->subDays(4),
            'date_confirmation'  => now()->subDays(3),
        ]);

        Livraison::create([
            'commande_id'          => $cmd1->id,
            'societe_transport_id' => $transport->id,
            'camion_id'            => $cam1->id,
            'chauffeur_id'         => $chauf1->id,
            'statut'               => 'livree',
            'destination'          => 'Sfax Nord',
            'quantite_livree'      => 2000,
            'date_depart_prevue'   => now()->subDays(2),
            'date_arrivee_prevue'  => now()->subDays(2),
            'date_depart_reel'     => now()->subDays(2),
            'date_arrivee_reel'    => now()->subDays(2)->addHours(3),
        ]);

        Commande::create([
            'centre_elevage_id'  => $centres[1]->id,
            'societe_aliment_id' => $societes[1]->id,
            'produit_id'         => $produits[1]->id,
            'quantite'           => 5000,
            'unite'              => 'kg',
            'statut'             => 'en_cours',
            'date_commande'      => now()->subDays(2),
            'date_traitement'    => now()->subDays(1),
        ]);

        Commande::create([
            'centre_elevage_id' => $centres[2]->id,
            'produit_id'        => $produits[2]->id,
            'quantite'          => 3000,
            'unite'             => 'kg',
            'statut'            => 'nouvelle',
            'date_commande'     => now(),
        ]);
    }
}
