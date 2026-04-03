<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Camion extends Model
{
    use HasFactory;

    protected $fillable = ['societe_transport_id', 'immatriculation', 'capacite', 'type', 'statut'];

    public function societeTransport()
    {
        return $this->belongsTo(SocieteTransport::class);
    }

    public function livraisons()
    {
        return $this->hasMany(Livraison::class);
    }

    public function verifierDispo(): bool
    {
        return $this->statut === 'disponible';
    }
}
