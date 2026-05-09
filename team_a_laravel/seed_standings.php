<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\Standing;

$standings = [
    ['pos' => 1, 'team' => 'Atlético Nacional', 'pj' => 1, 'won' => 1, 'draw' => 0, 'lost' => 0, 'gf' => 2, 'ga' => 0, 'gd' => 2, 'pts' => 3, 'division' => 'A', 'form' => 'W'],
    ['pos' => 2, 'team' => 'Millonarios', 'pj' => 1, 'won' => 1, 'draw' => 0, 'lost' => 0, 'gf' => 1, 'ga' => 0, 'gd' => 1, 'pts' => 3, 'division' => 'A', 'form' => 'W'],
    ['pos' => 3, 'team' => 'Santa Fe', 'pj' => 1, 'won' => 0, 'draw' => 1, 'lost' => 0, 'gf' => 0, 'ga' => 0, 'gd' => 0, 'pts' => 1, 'division' => 'A', 'form' => 'D'],
    ['pos' => 4, 'team' => 'América de Cali', 'pj' => 1, 'won' => 0, 'draw' => 1, 'lost' => 0, 'gf' => 0, 'ga' => 0, 'gd' => 0, 'pts' => 1, 'division' => 'A', 'form' => 'D'],
];

foreach ($standings as $s) {
    Standing::updateOrCreate(['team' => $s['team'], 'division' => $s['division']], $s);
}

echo "Seeded " . count($standings) . " teams.\n";
