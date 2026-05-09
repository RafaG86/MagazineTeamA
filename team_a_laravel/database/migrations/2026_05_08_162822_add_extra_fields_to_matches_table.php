<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->string('match_time')->nullable()->after('match_date');
            $table->string('status')->default('scheduled')->after('match_time'); // scheduled | live | finished
            $table->string('round')->nullable()->after('status'); // Jornada 19, Cuartos, etc.
        });
    }

    public function down(): void
    {
        Schema::table('matches', function (Blueprint $table) {
            $table->dropColumn(['match_time', 'status', 'round']);
        });
    }
};
