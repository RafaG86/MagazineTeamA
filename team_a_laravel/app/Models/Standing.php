<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Standing extends Model
{
    protected $fillable = ['pos', 'team', 'logo', 'pj', 'won', 'draw', 'lost', 'gf', 'ga', 'gd', 'pts', 'form', 'division'];
}
