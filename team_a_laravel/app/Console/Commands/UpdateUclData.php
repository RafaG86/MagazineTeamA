<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class UpdateUclData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ucl:update {type=all} {league=ucl}';
    protected $description = 'Actualiza los datos de la Champions usando el Vision Pipeline';

    public function handle()
    {
        $controller = new \App\Http\Controllers\SportBotController();
        $league = $this->argument('league');
        $type = $this->argument('type');

        if ($league === 'ucl' || $league === 'all') {
            if ($type === 'standings' || $type === 'all') {
                $this->info('Actualizando tabla de Champions...');
                $res = $controller->getUclStandings();
                $this->info('Resultado: ' . $res->getContent());
            }

            if ($type === 'results' || $type === 'all') {
                $this->info('Actualizando marcadores de Champions...');
                $res = $controller->getUclResults();
                $this->info('Resultado: ' . $res->getContent());
            }
        }

        if ($league === 'dimayor' || $league === 'all') {
            if ($type === 'standings' || $type === 'all') {
                $this->info('Actualizando tabla de Liga Dimayor...');
                $res = $controller->getDimayorStandings();
                $this->info('Resultado: ' . $res->getContent());
            }

            if ($type === 'results' || $type === 'all') {
                $this->info('Actualizando marcadores de Liga Dimayor...');
                $res = $controller->getDimayorResults();
                $this->info('Resultado: ' . $res->getContent());
            }
        }

        return 0;
    }
}
