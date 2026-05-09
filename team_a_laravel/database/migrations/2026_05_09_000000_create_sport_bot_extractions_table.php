<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sport_bot_extractions', function (Blueprint $description) {
            $description->id();
            $description->string('source_url');
            $description->string('type'); // 'standings' or 'results'
            $description->string('tournament');
            $description->longText('raw_data'); // JSON string from IA
            $description->boolean('is_consolidated')->default(false);
            $description->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sport_bot_extractions');
    }
};
