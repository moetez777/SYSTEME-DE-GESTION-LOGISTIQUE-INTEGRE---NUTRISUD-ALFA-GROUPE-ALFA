<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('societes_transport', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('adresse')->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->integer('flotte')->default(0); // nombre de camions total
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        Schema::create('camions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('societe_transport_id')->constrained('societes_transport')->onDelete('cascade');
            $table->string('immatriculation')->unique();
            $table->float('capacite'); // en tonnes
            $table->string('type')->default('standard'); // frigorifique, benne, standard
            $table->string('statut')->default('disponible'); // disponible, en_mission, maintenance
            $table->timestamps();
        });

        Schema::create('chauffeurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('societe_transport_id')->constrained('societes_transport')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('nom');
            $table->string('prenom');
            $table->string('telephone')->nullable();
            $table->string('permis')->nullable(); // numéro de permis
            $table->string('statut')->default('disponible'); // disponible, en_mission
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chauffeurs');
        Schema::dropIfExists('camions');
        Schema::dropIfExists('societes_transport');
    }
};
