<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockAliment extends Model
{
    use HasFactory;

    protected $table = 'stocks_aliment';

    protected $fillable = ['societe_aliment_id', 'produit_id', 'quantite_dispo', 'seuil_alerte', 'date_maj'];

    protected $casts = ['date_maj' => 'datetime'];

    public function societeAliment()
    {
        return $this->belongsTo(SocieteAliment::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function ajouterStock(int $quantite): void
    {
        $this->quantite_dispo += $quantite;
        $this->date_maj = now();
        $this->save();
    }

    public function retirerStock(int $quantite): bool
    {
        if ($this->quantite_dispo < $quantite) {
            return false;
        }
        $this->quantite_dispo -= $quantite;
        $this->date_maj = now();
        $this->save();
        return true;
    }

    public function estEnAlerte(): bool
    {
        return $this->quantite_dispo <= $this->seuil_alerte;
    }
}
