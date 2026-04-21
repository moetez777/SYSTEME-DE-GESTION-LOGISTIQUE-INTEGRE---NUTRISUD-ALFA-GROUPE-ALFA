<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $fillable = [
        'centre_elevage_id', 'societe_aliment_id', 'societe_transport_id', 'produit_id',
        'quantite', 'unite', 'statut', 'date_commande',
        'date_traitement', 'date_confirmation', 'notes',
    ];

    protected $casts = [
        'date_commande'    => 'datetime',
        'date_traitement'  => 'datetime',
        'date_confirmation'=> 'datetime',
    ];

    // Statuts possibles
    const STATUT_NOUVELLE   = 'nouvelle';
    const STATUT_EN_COURS   = 'en_cours';
    const STATUT_CONFIRMEE  = 'confirmee';
    const STATUT_REFUSEE    = 'refusee';
    const STATUT_ANNULEE    = 'annulee';

    public function centreElevage()
    {
        return $this->belongsTo(CentreElevage::class);
    }

    public function societeAliment()
    {
        return $this->belongsTo(SocieteAliment::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function societeTransport()
    {
        return $this->belongsTo(SocieteTransport::class);
    }

    public function livraison()
    {
        return $this->hasOne(Livraison::class);
    }

    public function peutEtreAnnulee(): bool
    {
        return in_array($this->statut, [self::STATUT_NOUVELLE, self::STATUT_EN_COURS]);
    }
}
