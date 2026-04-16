"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle, FontSize } from "@tiptap/extension-text-style";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

const FONT_SIZES = ["14px", "16px", "18px", "20px", "24px"];

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      FontSize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] rounded-b-md border border-t-0 border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none rich-text-content ProseMirror",
      },
    },
    content: value || "<p></p>",
    onUpdate: ({ editor: tiptapEditor }) => {
      onChange(tiptapEditor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl || "");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="rich-text-editor rounded-md border border-gray-300 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 bg-[#f8f5f1] p-2 text-xs text-gray-500">
          Loading editor…
        </div>
        <div className="min-h-[120px] px-3 py-2 text-sm text-gray-400">
          Preparing formatting toolbar…
        </div>
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      <div className="flex flex-wrap gap-2 rounded-t-md border border-gray-300 bg-[#f8f5f1] p-2 text-xs">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="rounded border border-gray-300 bg-white px-2 py-1"
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="rounded border border-gray-300 bg-white px-2 py-1"
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className="rounded border border-gray-300 bg-white px-2 py-1"
        >
          Underline
        </button>
        <button
          type="button"
          onClick={setLink}
          className="rounded border border-gray-300 bg-white px-2 py-1"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className="rounded border border-gray-300 bg-white px-2 py-1"
        >
          Align Left
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className="rounded border border-gray-300 bg-white px-2 py-1"
        >
          Align Center
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className="rounded border border-gray-300 bg-white px-2 py-1"
        >
          Align Right
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="rounded border border-gray-300 bg-white px-2 py-1"
        >
          Bullet List
        </button>
        <select
          className="rounded border border-gray-300 bg-white px-2 py-1"
          value={(editor.getAttributes("textStyle").fontSize as string) || ""}
          onChange={(e) => {
            if (!e.target.value) {
              editor.chain().focus().unsetFontSize().run();
              return;
            }
            editor.chain().focus().setFontSize(e.target.value).run();
          }}
        >
          <option value="">Font Size</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
