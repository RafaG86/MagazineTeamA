<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SportMatch extends Model
{
    protected $table = 'matches';
    protected $fillable = [
        'tournament',
        'home_team', 'away_team', 'home_score', 'away_score', 'match_date', 'match_time', 'status', 'round'];
}
