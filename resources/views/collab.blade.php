<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Document — {{ config('app.name', 'Laravel') }}</title>
        @vite(['resources/css/app.css', 'resources/js/collab.ts'])
    </head>
    <body class="font-sans antialiased">
        <div id="toolbar" class="collab-toolbar" role="toolbar" aria-label="Formatting"></div>

        <main id="editor" class="mx-auto w-full max-w-3xl px-6 py-16"></main>

        <script>
            window.collab = @json($collab);
        </script>
    </body>
</html>
