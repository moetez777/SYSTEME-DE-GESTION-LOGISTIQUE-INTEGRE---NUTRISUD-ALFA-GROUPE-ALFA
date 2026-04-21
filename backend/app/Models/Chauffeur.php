<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chauffeur extends Model
{
    use HasFactory;

    protected $fillable = ['societe_transport_id', 'user_id', 'nom', 'prenom', 'email', 'telephone', 'permis', 'statut'];

    protected $appends = ['disponible', 'nom_complet'];

    public function societeTransport()
    {
        return $this->belongsTo(SocieteTransport::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function livraisons()
    {
        return $this->hasMany(Livraison::class);
    }

    public function getDisponibleAttribute(): bool
    {
        return $this->statut === 'disponible';
    }

    public function getNomCompletAttribute(): string
    {
        return $this->prenom . ' ' . $this->nom;
    }

    public function effectuerLivraison(): bool
    {
        return $this->statut === 'disponible';
    }
}
