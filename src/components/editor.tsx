/* eslint-disable @next/next/no-img-element */
'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { DOMParser as ProseMirrorDOMParser } from 'prosemirror-model';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Separator } from './ui/separator';
import CodeBlock from './icons/codeblock';
import { marked } from 'marked';
import { toast } from 'sonner';
import { useEditorStore } from '@/store/editorStore';
import { useNoteStore } from '@/store/noteStore';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Code,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo,
  Redo,
  Forward,
} from 'lucide-react';
import { Button } from './ui/button';
import Star from './icons/star';
import ListItem from '@tiptap/extension-list-item';
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu';
import { useRef, useEffect } from 'react';
import { Input } from './ui/input';
import Preference from './preference';

interface TiptapProps {
  content: string;
  editable?: boolean;
  onContentChange?: (content: string) => void;
}

const Tiptap = ({ content, editable, onContentChange }: TiptapProps) => {
  const {
    prompt,
    setPrompt,
    responseLoading,
    setResponseLoading,
    showPromptInput,
    togglePromptInput,
    lengthValue,
    setLengthValue,
    lengthLabel,
    setLengthLabel,
    structure,
    setStructure,
    tone,
    setTone,
  } = useEditorStore();

  const { hasUnsavedChanges, setHasUnsavedChanges } = useNoteStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showPromptInput && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [showPromptInput]);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt) {
      toast.error('Prompt cannot be empty.', { id: 'generate' });
      return;
    }

    setResponseLoading(true);
    toast.loading('Generating...', {
      id: 'generate',
    });

    let finalPrompt = `Create a note on "${prompt}" with a ${structure} structure, ${lengthLabel} in length and a ${tone} tone. Do not include main heading at top! Make sure that notes is structured and detailed.`;

    console.log(finalPrompt);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.dismiss('generate');

        const html = await marked(data.response);
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        doc.querySelectorAll('pre code').forEach((codeBlock) => {
          const lines = codeBlock.textContent?.split('\n');
          if (lines && lines.length > 1) {
            lines.pop();
            codeBlock.textContent = lines.join('\n');
          }
        });

        if (!editor) {
          toast.error('Editor is not initialized.', {
            id: 'generate',
          });
          return;
        }

        const fragment = ProseMirrorDOMParser.fromSchema(
          editor.view.state.schema,
        ).parse(doc.body);

        const { tr, selection } = editor.view.state;
        let transaction = tr;

        const isInline = editor.view.state.selection.$from.parent.inlineContent;
        if (isInline) {
          transaction = tr.replaceSelectionWith(fragment).scrollIntoView();
        } else {
          transaction = tr
            .insert(
              selection.from,
              editor.view.state.schema.nodes.hard_break.create(),
            )
            .replaceSelectionWith(fragment)
            .scrollIntoView();
        }

        // Additional cleanup of empty blocks if needed
        const startPos = transaction.selection.from - fragment.content.size;
        if (startPos > 0) {
          const prevNode = transaction.doc.nodeAt(startPos - 1);
          if (prevNode && prevNode.isTextblock && prevNode.content.size === 0) {
            const deleteStart = Math.max(startPos - prevNode.nodeSize, 0);
            transaction = transaction.delete(deleteStart, startPos);
          }
        } else if (startPos === 0) {
          const firstNode = transaction.doc.firstChild;
          if (
            firstNode &&
            firstNode.isTextblock &&
            firstNode.content.size === 0
          ) {
            transaction = transaction.delete(0, firstNode.nodeSize);
          }
        }

        editor.view.dispatch(transaction);
      } else {
        toast.error('An error occurred.', {
          id: 'generate',
        });
      }
    } catch (error) {
      toast.error('An error occurred.', {
        id: 'generate',
      });
    } finally {
      setResponseLoading(false);
      setPrompt('');
    }
  };

  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:ring-0 outline-none p-0 rounded-b-md h-fit text-[1.05rem] text-wrap font-medium flex flex-col gap-3',
      },
    },
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Start typing...' }),
      ListItem,
      BubbleMenuExtension.configure({
        element:
          typeof document !== 'undefined'
            ? (document.querySelector('.bubble-menu') as HTMLElement)
            : null,
      }),
    ],
    editable: editable,
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onContentChange) {
        onContentChange(html);
        setHasUnsavedChanges(true);
      }
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const promptInput = (
    <div
      className={`input flex gap-2 relative z-10 rounded-md overflow-hidden ${
        showPromptInput ? 'h-10 mb-2' : 'h-0 mb-0 opacity-0'
      } transition-all duration-300`}
    >
      <form
        onSubmit={handlePromptSubmit}
        className="propmtfield h-auto flex bg-secondary rounded-md justify-between items-center w-full"
      >
        <Input
          placeholder="Ask Gemini"
          disabled={responseLoading}
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="font-medium bg-transparent border-none focus:ring-0 h-fit transition-all duration-300 w-full"
        />
        <Preference />

        <Button
          type="submit"
          variant={'secondary'}
          className="h-fit w-fit p-2 pr-3 flex justify-center items-center rounded-md right-0 transition-all duration-300"
          disabled={responseLoading}
        >
          <Forward className="h-5 w-5 scale-110" />
        </Button>
      </form>
    </div>
  );
  return (
    <div spellCheck="false" className="w-full">
      {editor && (
        <BubbleMenu
          editor={editor}
          className={`toolbar scale-90 bubble-menu ${
            editable ? 'flex' : 'hidden'
          } flex-col bg-background p-[8px] border-[1.5px] border-border rounded-[12px] gap-2`}
        >
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <Button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
              className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
            >
              <Bold className="h-5 w-5 scale-90" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
              className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
            >
              <Italic className="h-5 w-5 scale-90" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
              className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
            >
              <UnderlineIcon className="h-5 w-5 scale-90" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
              className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
            >
              <Strikethrough className="h-5 w-5 scale-90" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editor.can().chain().focus().toggleCode().run()}
              variant={editor.isActive('code') ? 'secondary' : 'ghost'}
              className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
            >
              <Code className="h-5 w-5 scale-90" />
            </Button>
          </div>
        </BubbleMenu>
      )}
      <div v-if={editor}>
        {editor && (
          <div
            className={`w-full fixed lg:absolute bottom-0 left-0 flex flex-col justify-center items-center py-3 ${editable ? 'bg-background' : 'bg-transparent h-0 overflow-hidden'} z-40 overflow-hidden`}
          >
            <div
              className={`bg-background w-fit max-w-[90%] ${
                editable ? 'opacity-100' : 'opacity-0 pointer-events-none'
              } border-[1.5px] border-border rounded-xl bg-background p-2 relative shadow-lg`}
            >
              {promptInput}
              <div className="flex items-center w-full relative">
                {/* Scrollable toolbar area */}
                <div className="overflow-x-auto scrollbar-hide w-full">
                  <div className="toolbar w-max flex items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      disabled={
                        !editor.can().chain().focus().toggleBold().run()
                      }
                      variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <Bold className="h-5 w-5 scale-90" />
                    </Button>
                    <Button
                      onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                      }
                      disabled={
                        !editor.can().chain().focus().toggleItalic().run()
                      }
                      variant={
                        editor.isActive('italic') ? 'secondary' : 'ghost'
                      }
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <Italic className="h-5 w-5 scale-90" />
                    </Button>
                    <Button
                      onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                      }
                      disabled={
                        !editor.can().chain().focus().toggleUnderline().run()
                      }
                      variant={
                        editor.isActive('underline') ? 'secondary' : 'ghost'
                      }
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <UnderlineIcon className="h-5 w-5 scale-90" />
                    </Button>
                    <Button
                      onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                      }
                      disabled={
                        !editor.can().chain().focus().toggleStrike().run()
                      }
                      variant={
                        editor.isActive('strike') ? 'secondary' : 'ghost'
                      }
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <Strikethrough className="h-5 w-5 scale-90" />
                    </Button>
                    <Separator
                      orientation="vertical"
                      className="h-7 flex-shrink-0"
                    />
                    <Button
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                      }
                      variant={
                        editor.isActive('heading', { level: 1 })
                          ? 'secondary'
                          : 'ghost'
                      }
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <Heading1 className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                      }
                      variant={
                        editor.isActive('heading', { level: 2 })
                          ? 'secondary'
                          : 'ghost'
                      }
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <Heading2 className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                      }
                      variant={
                        editor.isActive('heading', { level: 3 })
                          ? 'secondary'
                          : 'ghost'
                      }
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <Heading3 className="h-5 w-5" />
                    </Button>
                    <Separator
                      orientation="vertical"
                      className="h-7 flex-shrink-0"
                    />
                    <Button
                      onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                      }
                      variant={
                        editor.isActive('orderedList') ? 'secondary' : 'ghost'
                      }
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <ListOrdered className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                      }
                      variant={
                        editor.isActive('bulletList') ? 'secondary' : 'ghost'
                      }
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <List className="h-5 w-5" />
                    </Button>
                    <Separator
                      orientation="vertical"
                      className="h-7 flex-shrink-0"
                    />
                    <Button
                      onClick={() => editor.chain().focus().toggleCode().run()}
                      disabled={
                        !editor.can().chain().focus().toggleCode().run()
                      }
                      variant={editor.isActive('code') ? 'secondary' : 'ghost'}
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <Code className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                      }
                      variant={
                        editor.isActive('codeBlock') ? 'secondary' : 'ghost'
                      }
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <CodeBlock />
                    </Button>
                    <Separator
                      orientation="vertical"
                      className="h-7 flex-shrink-0"
                    />
                    <Button
                      onClick={() => editor.chain().focus().undo().run()}
                      disabled={!editor.can().chain().focus().undo().run()}
                      variant="ghost"
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <Undo className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={() => editor.chain().focus().redo().run()}
                      disabled={!editor.can().chain().focus().redo().run()}
                      variant="ghost"
                      className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2"
                    >
                      <Redo className="h-5 w-5" />
                    </Button>
                    <div className="sticky right-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-background via-background to-transparent">
                      <Button
                        className="h-fit w-fit flex-shrink-0 flex items-center justify-center p-2 shadow-sm"
                        style={{
                          background:
                            'linear-gradient(310deg, #1A9CDC -16.15%, #8C65BA 70.75%)',
                        }}
                        onClick={() => {
                          togglePromptInput();
                          setPrompt('');
                        }}
                      >
                        <Star
                          className={`${showPromptInput ? 'rotate-90' : 'rotate-0'} transition-transform h-5 w-5`}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
