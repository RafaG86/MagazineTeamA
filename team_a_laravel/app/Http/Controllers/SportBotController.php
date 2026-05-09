<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Gemini\Enums\MimeType;

class SportBotController extends Controller
{
    private function askDeepSeek(string $prompt, string $model = 'deepseek-chat'): array
    {
        $apiKey = env('DEEPSEEK_API_KEY');

        $response = Http::withToken($apiKey)
            ->timeout(120)
            ->post('https://api.deepseek.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    ['role' => 'system', 'content' => 'Eres un asistente deportivo experto. Responde ÚNICAMENTE con JSON puro que cumpla estrictamente el formato pedido.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'response_format' => ['type' => 'json_object'],
                'temperature' => ($model === 'deepseek-reasoner' ? null : 0.2) // Reasoner doesn't support temperature
            ]);

        if ($response->failed()) {
            throw new \Exception("Error DeepSeek: " . $response->status());
        }

        return json_decode($response->json()['choices'][0]['message']['content'] ?? '{}', true) ?? [];
    }

    /**
     * CAPTURA visualmente una página y extrae datos usando Gemini Vision.
     */
    private function captureAndExtract(string $url, string $type, string $tournament)
    {
        set_time_limit(180);
        
        $nodePath = 'C:\\Program Files\\nodejs\\node.exe';
        $scriptPath = base_path('scripts/scrape.cjs');
        $tempFile = storage_path('app/public/bot_screenshots/temp_' . time() . '.png');
        
        Log::info("Capturing $url for $tournament ($type)");
        Log::info("Env PATH: " . getenv('PATH'));
        
        $process = new \Symfony\Component\Process\Process([$nodePath, $scriptPath, $url, 'screenshot', $tempFile]);
        $process->setTimeout(180);
        $process->setEnv([
            'TMP' => sys_get_temp_dir(),
            'TEMP' => sys_get_temp_dir(),
            'HOME' => storage_path('app'),
            'USERPROFILE' => storage_path('app/puppeteer_home'),
            'LOCALAPPDATA' => storage_path('app/puppeteer_home'),
            'PUPPETEER_CACHE_DIR' => storage_path('app/puppeteer_cache'),
            'PATH' => getenv('PATH') . ';C:\\Windows\\System32',
        ]);
        $process->run();

        if (!$process->isSuccessful() || !file_exists($tempFile)) {
            Log::error("Scraper failed. Error: " . $process->getErrorOutput());
            throw new \Exception("Error: El scraper falló.");
        }

        $base64 = base64_encode(file_get_contents($tempFile));

        // 1.5 Guardar con nombre definitivo
        $filename = $type . '_' . time() . '_' . rand(100, 999) . '.png';
        $finalPath = storage_path('app/public/bot_screenshots/' . $filename);
        rename($tempFile, $finalPath);

        // 2. Procesar con Gemini Vision (con Fallback a DeepSeek Text)
        $prompt = ($type === 'standings') 
            ? "Lee esta imagen de una tabla de posiciones de $tournament y extrae los datos JSON: { \"standings\": [ { \"pos\": 1, \"team\": \"...\", \"pj\": 0, \"pts\": 0, \"gd\": 0, \"form\": \"...\" } ] }"
            : "Lee esta imagen de resultados de $tournament y extrae los datos JSON: { \"round\": \"...\", \"matches\": [ { \"home_team\": \"...\", \"away_team\": \"...\", \"home_score\": 0, \"away_score\": 0, \"status\": \"finished\" } ] }";

        try {
            $result = Gemini::generativeModel('gemini-2.0-flash')
                ->generateContent([
                    $prompt,
                    new \Gemini\Data\Blob(mimeType: MimeType::IMAGE_PNG, data: $base64)
                ]);
            $text = $result->text();
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'quota') || str_contains($e->getMessage(), 'Rate limit')) {
                Log::warning("Gemini Quota Exceeded. Falling back to DeepSeek Text Scraping for $url");
                
                // Fallback: Capturar texto y usar DeepSeek
                $textProcess = new \Symfony\Component\Process\Process([$nodePath, $scriptPath, $url, 'text']);
                $textProcess->setEnv(['PATH' => getenv('PATH') . ';C:\\Windows\\System32']); // Asegurar path
                $textProcess->run();
                $pageText = $textProcess->getOutput();

                $fallbackPrompt = "Extrae los datos de $tournament de este texto en formato JSON. " . 
                    (($type === 'standings') ? "Formato: { \"standings\": [...] }" : "Formato: { \"round\": \"...\", \"matches\": [...] }") . 
                    "\n\nTexto:\n" . substr($pageText, 0, 10000);
                
                $jsonData = $this->askDeepSeek($fallbackPrompt);
                
                // Guardar en DB y salir
                DB::table('sport_bot_extractions')->insert([
                    'source_url' => $url,
                    'type' => $type,
                    'tournament' => $tournament,
                    'raw_data' => json_encode($jsonData),
                    'screenshot_path' => $filename,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                return $jsonData;
            }
            throw $e;
        }

        preg_match('/\{[\s\S]*\}/', $text, $jsonMatch);
        $jsonData = json_decode($jsonMatch[0] ?? '{}', true);

        // 3. Guardar en almacenamiento provisional
        DB::table('sport_bot_extractions')->insert([
            'source_url' => $url,
            'type' => $type,
            'tournament' => $tournament,
            'screenshot_path' => $filename,
            'raw_data' => json_encode($jsonData),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $jsonData;
    }

    /**
     * CONSOLIDA los datos provisionales de múltiples fuentes.
     */
    private function consolidateAndSave(string $type, string $tournament)
    {
        $extractions = DB::table('sport_bot_extractions')
            ->where('type', $type)
            ->where('tournament', $tournament)
            ->where('is_consolidated', false)
            ->orderByDesc('created_at')
            ->limit(3)
            ->get();

        if ($extractions->isEmpty()) return null;

        $combinedText = "";
        foreach ($extractions as $ext) {
            $combinedText .= "FUENTE ({$ext->source_url}):\n" . $ext->raw_data . "\n\n";
        }

        $prompt = "Compara los datos de las siguientes fuentes y genera la versión final y verídica para $tournament ($type). " .
            "Busca las coincidencias y resuelve discrepancias usando tu conocimiento interno. " .
            "Devuelve el JSON final siguiendo este formato exacto:\n" .
            (($type === 'standings') 
                ? "{ \"standings\": [ { \"pos\": 1, \"team\": \"...\", \"pj\": 0, \"pts\": 0, \"gd\": 0, \"form\": \"WWDLW\" } ] }"
                : "{ \"round\": \"...\", \"matches\": [ { \"home_team\": \"...\", \"away_team\": \"...\", \"home_score\": 0, \"away_score\": 0, \"status\": \"finished\" } ] }") .
            "\n\nFuentes:\n" . $combinedText;

        $finalJson = $this->askDeepSeek($prompt, 'deepseek-reasoner'); // Usar Reasoner (R1) para consolidación

        // Marcar como consolidadas
        DB::table('sport_bot_extractions')
            ->whereIn('id', $extractions->pluck('id'))
            ->update(['is_consolidated' => true]);

        return $finalJson;
    }

    public function getUclStandings()
    {
        try {
            // 1. Capturar de AS.com
            $this->captureAndExtract('https://resultados.as.com/resultados/futbol/champions/clasificacion/', 'standings', 'Champions League');
            
            // 2. Consolidar (por ahora con una sola fuente ya funciona el pipeline)
            $json = $this->consolidateAndSave('standings', 'Champions League');
            $standings = $json['standings'] ?? [];

            if (!empty($standings)) {
                \App\Models\Standing::where('division', 'like', 'UCL_%')->delete();
                foreach ($standings as $s) {
                    \App\Models\Standing::create([
                        'pos' => $s['pos'] ?? $s['position'] ?? 0, 
                        'team' => $s['team'], 
                        'pj' => $s['pj'] ?? $s['played'] ?? 0, 
                        'pts' => $s['pts'] ?? $s['points'] ?? 0,
                        'gd' => $s['gd'] ?? $s['diff'] ?? 0, 
                        'form' => $s['form'] ?? $s['streak'] ?? '-----', 
                        'division' => 'UCL_LEAGUE'
                    ]);
                }
            }

            return response()->json(['success' => true, 'standings' => $standings]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getUclResults()
    {
        try {
            // 1. Capturar de múltiples fuentes (Primero las más rápidas/estables)
            $this->captureAndExtract('https://resultados.as.com/resultados/futbol/champions/jornada/f_1/', 'results', 'Champions League');
            $this->captureAndExtract('https://www.espn.com.co/futbol/resultados/_/liga/uefa.champions', 'results', 'Champions League');
            
            try {
                $this->captureAndExtract('https://www.skysports.com/champions-league-results', 'results', 'Champions League');
            } catch (\Exception $e) {
                Log::warning("Sky Sports falló, continuando con el resto: " . $e->getMessage());
            }

            // 2. Consolidar
            $json = $this->consolidateAndSave('results', 'Champions League');
            $matches = $json['matches'] ?? [];
            $round = $json['round'] ?? 'Eliminatorias';

            if (!empty($matches)) {
                \App\Models\SportMatch::where('tournament', 'Champions League')->delete();
                foreach ($matches as $m) {
                    \App\Models\SportMatch::create([
                        'tournament' => 'Champions League',
                        'home_team' => $m['home_team'], 'away_team' => $m['away_team'],
                        'home_score' => $m['home_score'] ?? 0, 'away_score' => $m['away_score'] ?? 0,
                        'status' => $m['status'] ?? 'finished', 'round' => $round,
                        'match_date' => $m['match_date'] ?? now()->format('Y-m-d')
                    ]);
                }
            }

            return response()->json(['success' => true, 'matches' => $matches]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getStandings()
    {
        // Adaptamos la liga local al mismo pipeline si deseas, por ahora sigue igual o podemos visionarla
        return $this->getUclStandings(); // Ejemplo de redirección al nuevo pipeline
    }

    public function getResults()
    {
        return $this->getUclResults();
    }
}
