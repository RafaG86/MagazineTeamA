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
        $match = SportMatch::create($request->all());
        return response()->json($match, 201);
    }

    public function update(Request $request, $id)
    {
        $match = SportMatch::findOrFail($id);
        $match->update($request->all());
        return response()->json($match);
    }

    public function destroy($id)
    {
        SportMatch::destroy($id);
        return response()->json(['success' => true]);
    }
}
