---
paths:
  - 'resources/js/**'
  - resources/js/collab.ts
---

# Js

## Echo v2 join() prepends the presence- prefix
In laravel-echo v2, `echo.join('document.1')` subscribes to `presence-document.1` — the connector adds `presence-` itself. Passing `presence-document.1` produces `presence-presence-document.1`, which matches no Laravel channel pattern and makes /broadcasting/auth return 403 (not 401/419). Always pass the bare channel name to join().

## w-share DOES proxy WebSockets; test upgrades over HTTP/1.1
w-share (src/server/index.ts + src/client/index.ts) fully proxies WebSocket upgrades end-to-end. Testing with curl over HTTPS negotiates HTTP/2, where WS upgrades don't apply — the tunnel then returns a misleading 500. WS only works over HTTP/1.1 (which browsers use). Verify with `curl --http1.1 ... -H "Upgrade: websocket" ...` → expect 101. The share stack (Reverb on :8080 through crdt-laravel-ws.share.brunobernard.dev) supports live Yjs sync.

## Collaboration carets: widget decorations cannot be CSS-transitioned
CollaborationCaret's `render` output is a ProseMirror widget decoration — y-tiptap's createDecorations rebuilds it on every awareness update, so a fresh DOM node replaces the old one and CSS transitions never fire (that is the "jumpy" caret). Fix in place: `render` returns an invisible inline anchor that tracks the document position, while persistent caret+label nodes live in `.collaboration-carets__overlay` and are moved via translate3d with a transition, positioned from getBoundingClientRect in a rAF. Do not restore styling on the widget itself. Note y-tiptap calls the builder as (user, clientId) though the published type declares only (user).
