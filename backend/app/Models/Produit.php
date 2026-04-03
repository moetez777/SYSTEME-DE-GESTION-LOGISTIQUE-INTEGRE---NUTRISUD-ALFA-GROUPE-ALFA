<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'type', 'unite', 'prix_unitaire', 'description', 'actif'];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'actif' => 'boolean',
    ];

    public function stocksAliment()
    {
        return $this->hasMany(StockAliment::class);
    }

    public function stocksCentre()
    {
        return $this->hasMany(StockCentre::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    public function getPrix(): float
    {
        return (float) $this->prix_unitaire;
    }
}
