<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team A - Magazine Actualizable</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
    <div id="progress-root" style="display: none">
        <div class="progress-container">
            <div id="progress-bar" class="progress-bar" style="width: 0%"></div>
        </div>
    </div>

    <header class="header">
        <div class="brand">
            <i data-lucide="trophy"></i> Team A Sports
        </div>
        <nav style="display: flex; gap: 1rem;">
            <button class="btn btn-secondary" onclick="window.print()">
                <i data-lucide="printer"></i> Imprimir
            </button>
            <button class="btn" id="login-btn">
                <i data-lucide="user"></i> Admin
            </button>
        </nav>
    </header>

    <div class="sections-bar">
        <div class="container" style="display: flex; gap: 1.5rem; overflow-x: auto; white-space: nowrap; padding: 0.5rem 2rem;">
            <a href="#" class="section-link active">General</a>
            <a href="#" class="section-link">Liga Betplay</a>
            <a href="#" class="section-link">Selección Colombia</a>
            <a href="#" class="section-link">Champions League</a>
            <a href="#" class="section-link">Mundial 2026</a>
            <a href="#" class="section-link">Charla Técnica</a>
            <a href="#" class="section-link">Efemérides</a>
            <a href="#" class="section-link">Fórmula 1</a>
            <a href="#" class="section-link">Colombianos Exterior</a>
        </div>
    </div>

    <main class="container">
        @yield('content')
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2025 Team A Sports Magazine - Edición Digital Actualizable</p>
            <div style="display: flex; gap: 1rem; margin-top: 1rem; justify-content: center; opacity: 0.7;">
                <a href="#">Privacidad</a>
                <a href="#">Términos</a>
                <a href="#">Contacto</a>
            </div>
        </div>
    </footer>

    <script>
        lucide.createIcons();
    </script>
    @stack('scripts')
</body>
</html>
