<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('societes_elevage', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('adresse')->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        Schema::create('centres_elevage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('societe_elevage_id')->constrained('societes_elevage')->onDelete('cascade');
            $table->string('nom');
            $table->string('localisation')->nullable();
            $table->integer('capacite')->default(0); // nombre de volailles
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('centres_elevage');
        Schema::dropIfExists('societes_elevage');
    }
};
