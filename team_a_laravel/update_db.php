<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

echo "Actualizando esquema de magazine.db...\n";

if (!Schema::hasTable('sport_bot_extractions')) {
    Schema::create('sport_bot_extractions', function (Blueprint $table) {
        $table->id();
        $table->string('source_url');
        $table->string('type');
        $table->string('tournament');
        $table->longText('raw_data');
        $table->string('screenshot_path')->nullable();
        $table->boolean('is_consolidated')->default(false);
        $table->timestamps();
    });
    echo "Tabla sport_bot_extractions creada.\n";
}

Schema::table('standings', function (Blueprint $table) {
    if (!Schema::hasColumn('standings', 'division')) $table->string('division')->nullable();
    if (!Schema::hasColumn('standings', 'form')) $table->string('form')->nullable();
    if (!Schema::hasColumn('standings', 'won')) $table->integer('won')->default(0);
    if (!Schema::hasColumn('standings', 'draw')) $table->integer('draw')->default(0);
    if (!Schema::hasColumn('standings', 'lost')) $table->integer('lost')->default(0);
    if (!Schema::hasColumn('standings', 'gf')) $table->integer('gf')->default(0);
    if (!Schema::hasColumn('standings', 'ga')) $table->integer('ga')->default(0);
    if (!Schema::hasColumn('standings', 'created_at')) $table->timestamps();
});
echo "Tabla standings actualizada.\n";

Schema::table('matches', function (Blueprint $table) {
    if (!Schema::hasColumn('matches', 'tournament')) $table->string('tournament')->nullable();
    if (!Schema::hasColumn('matches', 'status')) $table->string('status')->default('finished');
    if (!Schema::hasColumn('matches', 'round')) $table->string('round')->nullable();
    if (!Schema::hasColumn('matches', 'created_at')) $table->timestamps();
});
echo "Tabla matches actualizada.\n";

echo "Listo.\n";
