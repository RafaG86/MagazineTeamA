<?php

namespace App\Http\Controllers;

use App\Models\Standing;
use Illuminate\Http\Request;

class StandingsController extends Controller
{
    public function index()
    {
        return response()->json(['standings' => Standing::orderBy('division')->orderBy('pos')->get()]);
    }

    public function store(Request $request)
    {
        Standing::truncate();
        foreach ($request->input('standings', []) as $s) {
            Standing::create($s);
        }
        return response()->json(['success' => true]);
    }
}
