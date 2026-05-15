<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            'image_url' => 'nullable|string',
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
            'image_url' => 'sometimes|nullable|string',
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

    public function uploadImage(Request $request)
    {
        // --- Strategy 1: base64 JSON (used by the frontend to avoid Mixed Content / proxy truncation) ---
        if ($request->has('image_base64')) {
            $dataUrl = $request->input('image_base64');

            // Parse  "data:image/jpeg;base64,/9j/4AAQ..."
            if (!preg_match('/^data:(image\/(?:jpeg|png|gif|webp));base64,(.+)$/i', $dataUrl, $m)) {
                return response()->json(['error' => 'Formato de imagen no válido.'], 422);
            }

            $mimeType  = $m[1];                        // e.g. "image/jpeg"
            $decoded   = base64_decode($m[2]);

            if ($decoded === false || strlen($decoded) < 10) {
                return response()->json(['error' => 'No se pudo decodificar la imagen.'], 422);
            }

            if (strlen($decoded) > 5 * 1024 * 1024) {
                return response()->json(['error' => 'La imagen supera los 5MB.'], 422);
            }

            $ext      = str_replace('image/', '', $mimeType); // jpeg / png / gif / webp
            $ext      = $ext === 'jpeg' ? 'jpg' : $ext;
            $filename = 'posts/' . \Illuminate\Support\Str::random(40) . '.' . $ext;

            \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $decoded);

            return response()->json(['image_url' => '/storage/' . $filename]);
        }

        // --- Strategy 2: classic multipart (fallback / artisan tests) ---
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
        ]);

        $path = $request->file('image')->store('posts', 'public');

        return response()->json(['image_url' => '/storage/' . $path]);
    }
}
