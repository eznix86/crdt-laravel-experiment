import type { Editor } from '@tiptap/core';

type ToolbarItem = {
    label: string;
    title: string;
    isActive: (editor: Editor) => boolean;
    run: (editor: Editor) => void;
};

type ToolbarGroup = ToolbarItem[];

const groups: ToolbarGroup[] = [
    [
        {
            label: 'B',
            title: 'Bold',
            isActive: (editor) => editor.isActive('bold'),
            run: (editor) => editor.chain().focus().toggleBold().run(),
        },
        {
            label: 'I',
            title: 'Italic',
            isActive: (editor) => editor.isActive('italic'),
            run: (editor) => editor.chain().focus().toggleItalic().run(),
        },
        {
            label: 'U',
            title: 'Underline',
            isActive: (editor) => editor.isActive('underline'),
            run: (editor) => editor.chain().focus().toggleUnderline().run(),
        },
        {
            label: 'S',
            title: 'Strikethrough',
            isActive: (editor) => editor.isActive('strike'),
            run: (editor) => editor.chain().focus().toggleStrike().run(),
        },
        {
            label: '<>',
            title: 'Inline code',
            isActive: (editor) => editor.isActive('code'),
            run: (editor) => editor.chain().focus().toggleCode().run(),
        },
    ],
    [
        {
            label: 'H1',
            title: 'Heading 1',
            isActive: (editor) => editor.isActive('heading', { level: 1 }),
            run: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
            label: 'H2',
            title: 'Heading 2',
            isActive: (editor) => editor.isActive('heading', { level: 2 }),
            run: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
            label: '¶',
            title: 'Paragraph',
            isActive: (editor) => editor.isActive('paragraph'),
            run: (editor) => editor.chain().focus().setParagraph().run(),
        },
    ],
    [
        {
            label: '• List',
            title: 'Bullet list',
            isActive: (editor) => editor.isActive('bulletList'),
            run: (editor) => editor.chain().focus().toggleBulletList().run(),
        },
        {
            label: '1. List',
            title: 'Ordered list',
            isActive: (editor) => editor.isActive('orderedList'),
            run: (editor) => editor.chain().focus().toggleOrderedList().run(),
        },
        {
            label: '❝',
            title: 'Blockquote',
            isActive: (editor) => editor.isActive('blockquote'),
            run: (editor) => editor.chain().focus().toggleBlockquote().run(),
        },
        {
            label: '{ }',
            title: 'Code block',
            isActive: (editor) => editor.isActive('codeBlock'),
            run: (editor) => editor.chain().focus().toggleCodeBlock().run(),
        },
    ],
];

export const mountToolbar = (element: HTMLElement, editor: Editor): void => {
    const buttons: { button: HTMLButtonElement; item: ToolbarItem }[] = [];

    for (const group of groups) {
        const groupElement = document.createElement('div');
        groupElement.className = 'collab-toolbar__group';

        for (const item of group) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'collab-toolbar__button';
            button.textContent = item.label;
            button.title = item.title;
            button.setAttribute('aria-label', item.title);
            button.setAttribute('aria-pressed', 'false');

            button.addEventListener('mousedown', (event) => {
                event.preventDefault();
            });

            button.addEventListener('click', () => {
                item.run(editor);
            });

            groupElement.append(button);
            buttons.push({ button, item });
        }

        element.append(groupElement);
    }

    const syncActiveState = (): void => {
        for (const { button, item } of buttons) {
            const active = item.isActive(editor);

            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', active ? 'true' : 'false');
        }
    };

    editor.on('transaction', syncActiveState);
    editor.on('selectionUpdate', syncActiveState);

    syncActiveState();
};
