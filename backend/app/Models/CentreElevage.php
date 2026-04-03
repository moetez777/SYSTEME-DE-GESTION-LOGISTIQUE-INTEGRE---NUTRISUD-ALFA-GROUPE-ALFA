<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CentreElevage extends Model
{
    use HasFactory;

    protected $table = 'centres_elevage';

    protected $fillable = ['societe_elevage_id', 'nom', 'localisation', 'capacite', 'actif'];

    protected $casts = ['actif' => 'boolean'];

    public function societeElevage()
    {
        return $this->belongsTo(SocieteElevage::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    public function stocks()
    {
        return $this->hasMany(StockCentre::class);
    }
}
