<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('centre_elevage_id')->constrained('centres_elevage')->onDelete('cascade');
            $table->foreignId('societe_aliment_id')->nullable()->constrained('societes_aliment')->onDelete('set null');
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->integer('quantite');
            $table->string('unite')->default('kg');
            $table->string('statut')->default('nouvelle'); // nouvelle|en_cours|confirmee|refusee|annulee
            $table->timestamp('date_commande')->useCurrent();
            $table->timestamp('date_traitement')->nullable(); // quand l'usine a traité
            $table->timestamp('date_confirmation')->nullable(); // quand confirmée prête
            $table->text('notes')->nullable(); // raison refus, remarques
            $table->timestamps();

            $table->index(['statut']);
            $table->index(['centre_elevage_id']);
            $table->index(['societe_aliment_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
