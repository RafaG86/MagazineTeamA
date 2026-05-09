<?php

namespace App\Http\Controllers;

use App\Models\SportMatch;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function index()
    {
        return response()->json(['matches' => SportMatch::orderBy('match_date')->orderBy('match_time')->get()]);
    }

    public function store(Request $request)
    {
        SportMatch::truncate();
        foreach ($request->input('matches', []) as $m) {
            SportMatch::create($m);
        }
        return response()->json(['success' => true]);
    }
}
