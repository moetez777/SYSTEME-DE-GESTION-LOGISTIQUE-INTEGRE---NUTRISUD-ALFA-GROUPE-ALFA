<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livraisons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->constrained('commandes')->onDelete('cascade');
            $table->foreignId('societe_transport_id')->constrained('societes_transport')->onDelete('cascade');
            $table->foreignId('camion_id')->nullable()->constrained('camions')->onDelete('set null');
            $table->foreignId('chauffeur_id')->nullable()->constrained('chauffeurs')->onDelete('set null');
            $table->string('statut')->default('planifiee'); // planifiee|en_cours|livree
            $table->string('destination')->nullable(); // adresse de livraison
            $table->integer('quantite_livree')->nullable();
            $table->timestamp('date_depart_prevue')->nullable();
            $table->timestamp('date_arrivee_prevue')->nullable();
            $table->timestamp('date_depart_reel')->nullable();
            $table->timestamp('date_arrivee_reel')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['statut']);
            $table->index(['chauffeur_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livraisons');
    }
};
