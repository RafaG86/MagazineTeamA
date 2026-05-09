<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::latest()->get();
        return response()->json([
            'posts' => $posts,
            'edition' => date('d/m/Y')
        ]);
    }

    public function store(Request $request)
    {
        $post = Post::create($request->all());
        return response()->json($post);
    }

    public function destroy($id)
    {
        Post::destroy($id);
        return response()->json(['success' => true]);
    }
}
