# crdt-laravel

Real-time collaborative rich-text editing with Tiptap, Yjs, and Laravel Reverb.

## Requirements

PHP 8.3+, Composer, Node.js.

## Setup

```bash
composer setup
php artisan reverb:install
```

`composer setup` installs dependencies, creates `.env`, generates the app key, migrates the SQLite database, and builds assets. `reverb:install` fills in the `REVERB_*` credentials.

## Run

```bash
composer dev
```

Starts the server, queue, logs, Vite, and the Reverb WebSocket server together.

## Try it

1. Open http://localhost:8000 and sign up.
2. Open the same URL in a second window (use a different browser or a private window, so you get a second account) and sign up again.
3. Type in either window.

You should see live text sync, and each user's caret with their name gliding as they move.

## Test

```bash
php artisan test
composer ci:check   # lint, formatting, types, tests
```
