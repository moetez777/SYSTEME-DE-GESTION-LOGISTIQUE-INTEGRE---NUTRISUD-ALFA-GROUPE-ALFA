<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SocieteElevage extends Model
{
    use HasFactory;

    protected $table = 'societes_elevage';

    protected $fillable = ['nom', 'adresse', 'telephone', 'email', 'actif'];

    protected $casts = ['actif' => 'boolean'];

    public function centres()
    {
        return $this->hasMany(CentreElevage::class);
    }
}
