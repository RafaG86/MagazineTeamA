<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('standings', function (Blueprint $table) {
            $table->integer('won')->default(0)->after('pj');
            $table->integer('draw')->default(0)->after('won');
            $table->integer('lost')->default(0)->after('draw');
            $table->integer('gf')->default(0)->after('lost');
            $table->integer('ga')->default(0)->after('gf');
            $table->string('logo')->nullable()->after('team');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('standings', function (Blueprint $table) {
            $table->dropColumn(['won', 'draw', 'lost', 'gf', 'ga', 'logo']);
        });
    }
};
