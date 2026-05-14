<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Añade soporte para penales en partidos empatados.
     * Los campos son nullable: solo se usan cuando hay empate en 90 min.
     */
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->integer('home_penalties')->nullable()->after('away_score');
            $table->integer('away_penalties')->nullable()->after('home_penalties');
        });
    }

    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn(['home_penalties', 'away_penalties']);
        });
    }
};
