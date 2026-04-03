<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Stock de l'usine (société aliment)
        Schema::create('stocks_aliment', function (Blueprint $table) {
            $table->id();
            $table->foreignId('societe_aliment_id')->constrained('societes_aliment')->onDelete('cascade');
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->integer('quantite_dispo')->default(0);
            $table->integer('seuil_alerte')->default(100); // seuil d'alerte stock bas
            $table->timestamp('date_maj')->nullable();
            $table->timestamps();

            $table->unique(['societe_aliment_id', 'produit_id']);
        });

        // Stock du centre d'élevage
        Schema::create('stocks_centre', function (Blueprint $table) {
            $table->id();
            $table->foreignId('centre_elevage_id')->constrained('centres_elevage')->onDelete('cascade');
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->integer('quantite')->default(0);
            $table->integer('seuil_alerte')->default(50);
            $table->timestamp('date_maj')->nullable();
            $table->timestamps();

            $table->unique(['centre_elevage_id', 'produit_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stocks_centre');
        Schema::dropIfExists('stocks_aliment');
    }
};
