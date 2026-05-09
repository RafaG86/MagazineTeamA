<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SportBotExtraction extends Model
{
    protected $table = 'sport_bot_extractions';
    protected $fillable = ['source_url', 'type', 'tournament', 'raw_data', 'screenshot_path', 'is_consolidated'];
}
