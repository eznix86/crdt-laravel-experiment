import { Editor } from '@tiptap/core';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCaret from '@tiptap/extension-collaboration-caret';
import StarterKit from '@tiptap/starter-kit';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';
import { mountToolbar } from './toolbar';
import '../css/collab.css';

declare global {
    interface Window {
        collab: {
            user: { id: number; name: string; color: string };
            documentId: number;
            csrfToken: string;
            reverb: { key: string; host: string; port: number; scheme: string };
        };
    }
}

const config = window.collab;

const toBase64 = (bytes: Uint8Array): string => {
    let binary = '';

    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }

    return btoa(binary);
};

const fromBase64 = (encoded: string): Uint8Array => {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
};

const echo = new Echo({
    broadcaster: 'reverb',
    Pusher,
    key: config.reverb.key,
    wsHost: config.reverb.host,
    wsPort: config.reverb.port,
    wssPort: config.reverb.port,
    forceTLS: config.reverb.scheme === 'https',
    disableStats: true,
    authEndpoint: '/broadcasting/auth',
});

const presence = echo.join(`document.${config.documentId}`);

const yDoc = new Y.Doc();
const awareness = new awarenessProtocol.Awareness(yDoc);
const provider = { awareness };

let pendingUpdates: Uint8Array[] = [];
let flushTimer: number | null = null;

const flushPendingUpdates = (): void => {
    flushTimer = null;

    if (pendingUpdates.length === 0) {
        return;
    }

    const update =
        pendingUpdates.length === 1
            ? pendingUpdates[0]
            : Y.mergeUpdates(pendingUpdates);

    pendingUpdates = [];

    presence.whisper('yjs', { u: toBase64(update) });
};

const sendStateVector = (): void => {
    presence.whisper('sync', { sv: toBase64(Y.encodeStateVector(yDoc)) });
};

let saveTimer: number | null = null;

const save = async (): Promise<void> => {
    saveTimer = null;

    const snapshot = Y.encodeStateAsUpdate(yDoc);

    await fetch(`/api/documents/${config.documentId}/state`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': config.csrfToken,
        },
        body: JSON.stringify({ state: toBase64(snapshot) }),
    });
};

const scheduleSave = (): void => {
    if (saveTimer !== null) {
        window.clearTimeout(saveTimer);
    }

    saveTimer = window.setTimeout(() => {
        void save();
    }, 2_000);
};

awareness.on(
    'update',
    (changes: { added: number[]; updated: number[] }, origin: unknown) => {
        if (origin === 'remote') {
            return;
        }

        const update = awarenessProtocol.encodeAwarenessUpdate(
            awareness,
            changes.added.concat(changes.updated),
        );

        if (update.length > 0) {
            presence.whisper('awareness', { a: toBase64(update) });
        }
    },
);

presence.listenForWhisper('awareness', (payload: { a: string }) => {
    awarenessProtocol.applyAwarenessUpdate(
        awareness,
        fromBase64(payload.a),
        'remote',
    );
});

yDoc.on('update', (update: Uint8Array, origin: unknown) => {
    if (origin !== 'remote') {
        pendingUpdates.push(update);

        if (flushTimer === null) {
            flushTimer = window.setTimeout(flushPendingUpdates, 100);
        }
    }

    scheduleSave();
});

presence.listenForWhisper('yjs', (payload: { u: string }) => {
    Y.applyUpdate(yDoc, fromBase64(payload.u), 'remote');
});

presence.listenForWhisper('sync', (payload: { sv: string }) => {
    const missing = Y.encodeStateAsUpdate(yDoc, fromBase64(payload.sv));

    if (missing.length > 0) {
        presence.whisper('yjs', { u: toBase64(missing) });
    }
});

presence.subscribed(() => {
    sendStateVector();
});

echo.connector.pusher.connection.bind('reconnected', () => {
    sendStateVector();
});

window.setInterval(sendStateVector, 30_000);

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        void save();
    }
});

window.addEventListener('pagehide', () => {
    awarenessProtocol.removeAwarenessStates(awareness, [awareness.clientID], 'unload');

    presence.whisper('awareness', {
        a: toBase64(
            awarenessProtocol.encodeAwarenessUpdate(awareness, [awareness.clientID]),
        ),
    });
});

type SmoothCaret = {
    caret: HTMLElement;
    label: HTMLElement;
    anchor: HTMLElement;
    placed: boolean;
};

const carets = new Map<number, SmoothCaret>();

const caretOverlay = document.createElement('div');
caretOverlay.className = 'collaboration-carets__overlay';

const buildCaret = (user: { name: string; color: string }): SmoothCaret => {
    const caret = document.createElement('div');
    caret.className = 'collaboration-carets__caret';
    caret.style.backgroundColor = user.color;

    const label = document.createElement('div');
    label.className = 'collaboration-carets__label';
    label.style.backgroundColor = user.color;
    label.textContent = user.name;

    caret.append(label);
    caretOverlay.append(caret);

    return { caret, label, anchor: document.createElement('span'), placed: false };
};

const renderCaretAnchor = (user: Record<string, any>, ...rest: unknown[]): HTMLElement => {
    const clientId = rest[0] as number;

    const name = typeof user.name === 'string' ? user.name : 'Anonymous';
    const color = typeof user.color === 'string' ? user.color : '#94a3b8';

    const entry = carets.get(clientId) ?? buildCaret({ name, color });

    if (entry.label.textContent !== name) {
        entry.label.textContent = name;
    }

    carets.set(clientId, entry);

    const anchor = document.createElement('span');
    anchor.className = 'collaboration-carets__anchor';
    entry.anchor = anchor;

    return anchor;
};

let caretFrame: number | null = null;

const positionCarets = (): void => {
    caretFrame = null;

    const overlayBox = caretOverlay.getBoundingClientRect();
    const measurements: { entry: SmoothCaret; x: number; y: number; height: number }[] = [];

    for (const entry of carets.values()) {
        if (!entry.anchor.isConnected) {
            continue;
        }

        const box = entry.anchor.getBoundingClientRect();

        measurements.push({
            entry,
            x: box.left - overlayBox.left,
            y: box.top - overlayBox.top,
            height: box.height,
        });
    }

    for (const { entry, x, y, height } of measurements) {
        entry.caret.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        entry.caret.style.height = `${height}px`;

        if (!entry.placed) {
            entry.caret.getBoundingClientRect();
            entry.caret.classList.add('is-visible', 'is-placed');
            entry.placed = true;
        }
    }
};

const removeDepartedCarets = (): void => {
    for (const [clientId, entry] of carets) {
        if (awareness.getStates().has(clientId)) {
            continue;
        }

        entry.caret.remove();
        carets.delete(clientId);
    }
};

const scheduleCaretPositioning = (): void => {
    if (caretFrame === null) {
        caretFrame = window.requestAnimationFrame(positionCarets);
    }
};

const boot = async (): Promise<void> => {
    const response = await fetch(`/api/documents/${config.documentId}/state`, {
        headers: { Accept: 'application/json' },
    });

    const { state } = (await response.json()) as { state: string | null };

    if (state !== null) {
        Y.applyUpdate(yDoc, fromBase64(state), 'remote');
    }

    const element = document.getElementById('editor') as HTMLElement;

    element.append(caretOverlay);

    const editor = new Editor({
        element,
        extensions: [
            StarterKit.configure({ undoRedo: false }),
            Collaboration.configure({ document: yDoc }),
            CollaborationCaret.configure({
                provider,
                user: {
                    id: config.user.id,
                    name: config.user.name,
                    color: config.user.color,
                },
                render: renderCaretAnchor,
            }),
        ],
        onTransaction: scheduleCaretPositioning,
    });

    mountToolbar(document.getElementById('toolbar') as HTMLElement, editor);

    awareness.on('change', () => {
        removeDepartedCarets();
        scheduleCaretPositioning();
    });

    window.addEventListener('resize', scheduleCaretPositioning);
    editor.view.dom.addEventListener('scroll', scheduleCaretPositioning);

    sendStateVector();
};

void boot();
