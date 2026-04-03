<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockCentre extends Model
{
    use HasFactory;

    protected $table = 'stocks_centre';

    protected $fillable = ['centre_elevage_id', 'produit_id', 'quantite', 'seuil_alerte', 'date_maj'];

    protected $casts = ['date_maj' => 'datetime'];

    public function centreElevage()
    {
        return $this->belongsTo(CentreElevage::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }

    public function verifierNiveau(): int
    {
        return $this->quantite;
    }

    public function alerteStock(): bool
    {
        return $this->quantite <= $this->seuil_alerte;
    }
}
