<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocieteTransport extends Model
{
    use HasFactory;

    protected $table = 'societes_transport';

    protected $fillable = ['nom', 'adresse', 'telephone', 'email', 'flotte', 'actif'];

    protected $casts = ['actif' => 'boolean'];

    public function camions()
    {
        return $this->hasMany(Camion::class);
    }

    public function chauffeurs()
    {
        return $this->hasMany(Chauffeur::class);
    }

    public function livraisons()
    {
        return $this->hasMany(Livraison::class);
    }
}
