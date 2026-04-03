<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocieteAliment extends Model
{
    use HasFactory;

    protected $table = 'societes_aliment';

    protected $fillable = ['nom', 'adresse', 'telephone', 'email', 'capacite_prod', 'actif'];

    protected $casts = ['actif' => 'boolean'];

    public function stocks()
    {
        return $this->hasMany(StockAliment::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }
}
