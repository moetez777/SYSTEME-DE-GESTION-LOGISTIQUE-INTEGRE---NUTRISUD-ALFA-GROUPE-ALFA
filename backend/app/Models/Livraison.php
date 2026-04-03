<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Livraison extends Model
{
    use HasFactory;

    protected $fillable = [
        'commande_id', 'societe_transport_id', 'camion_id', 'chauffeur_id',
        'statut', 'destination', 'quantite_livree',
        'date_depart_prevue', 'date_arrivee_prevue',
        'date_depart_reel', 'date_arrivee_reel', 'notes',
    ];

    protected $casts = [
        'date_depart_prevue'  => 'datetime',
        'date_arrivee_prevue' => 'datetime',
        'date_depart_reel'    => 'datetime',
        'date_arrivee_reel'   => 'datetime',
    ];

    const STATUT_PLANIFIEE = 'planifiee';
    const STATUT_EN_COURS  = 'en_cours';
    const STATUT_LIVREE    = 'livree';

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function societeTransport()
    {
        return $this->belongsTo(SocieteTransport::class);
    }

    public function camion()
    {
        return $this->belongsTo(Camion::class);
    }

    public function chauffeur()
    {
        return $this->belongsTo(Chauffeur::class);
    }

    public function confirmerLivraison(): void
    {
        $this->statut = self::STATUT_LIVREE;
        $this->date_arrivee_reel = now();
        $this->save();
    }
}
