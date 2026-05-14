<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with(['comments'])
            ->withCount(['comments', 'likes'])
            ->latest()
            ->get();
            
        return response()->json([
            'posts' => $posts,
            'edition' => date('d/m/Y')
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'section' => 'required|string',
            'author' => 'nullable|string'
        ]);

        $post = Post::create($validated);
        return response()->json($post, 201);
    }

    public function update(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'section' => 'sometimes|required|string',
        ]);

        // Author is IMMUTABLE — only set on creation, never overwritten
        $post->update($validated);
        return response()->json($post);
    }

    public function destroy($id)
    {
        $post = Post::findOrFail($id);
        $post->delete();
        return response()->json(['message' => 'Post eliminado correctamente']);
    }
}
