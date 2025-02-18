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
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
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
  Settings2,
} from 'lucide-react';
import { Button } from './ui/button';
import Star from './icons/star';
import ListItem from '@tiptap/extension-list-item';
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu';
import { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import Preference from './preference';

interface TiptapProps {
  content: string;
  editable?: boolean;
  onContentChange?: (content: string) => void;
}

const Tiptap = ({ content, editable, onContentChange }: TiptapProps) => {
  const [lengthValue, setLengthValue] = useState<number[]>([50]);
  const [lengthLabel, setLengthLabel] = useState<string>('Medium');
  const [structure, setStructure] = useState<string>('normal');
  const [tone, setTone] = useState<string>('normal');
  const [promt, setPrompt] = useState<string>('');
  const [responseLoading, setResponseLoading] = useState<boolean>(false);
  const [showPromptInput, setShowPromptInput] = useState<boolean>(false);
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

    if (!promt) {
      toast.error('Prompt cannot be empty.', {
        id: 'generate',
      });
      return;
    }

    setResponseLoading(true);
    toast.loading(
      <div className="flex items-center gap-1.5 -ml-1.5">
        <img
          src="/gemini.svg"
          alt=""
          className="h-6 w-6 animate-spin"
          style={{ animationDuration: '1.8s' }}
        />
        <div className=" font-semibold">Generating...</div>
      </div>,
      {
        id: 'generate',
      },
    );
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt:
            promt +
            '\n\nAdditional context: do not include main heading for the generated content. \n Make answer detailed and well structured.',
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
      onContentChange && onContentChange(html);
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
          value={promt}
          onChange={(e) => setPrompt(e.target.value)}
          className="font-medium bg-transparent border-none focus:ring-0 h-fit transition-all duration-300 w-full"
        />
        <Preference
          responseLoading={responseLoading}
          lengthValue={lengthValue}
          setLengthValue={setLengthValue}
          lengthLabel={lengthLabel}
          setLengthLabel={setLengthLabel}
          structure={structure}
          setStructure={setStructure}
          tone={tone}
          setTone={setTone}
        />

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
          <div className="flex gap-2">
            <Button
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
              className="h-fit w-fit flex items-center justify-center p-2"
            >
              <Bold className="h-5 w-5 scale-90" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
              className="h-fit w-fit flex items-center justify-center p-2"
            >
              <Italic className="h-5 w-5 scale-90" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
              className="h-fit w-fit flex items-center justify-center p-2"
            >
              <UnderlineIcon className="h-5 w-5 scale-90" />
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
              className="h-fit w-fit flex items-center justify-center p-2"
            >
              <Strikethrough className="h-5 w-5 scale-90" />
            </Button>
            <Button
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              variant={
                editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'
              }
              className="h-fit w-fit flex items-center justify-center p-2"
            >
              <Code />
            </Button>
          </div>
        </BubbleMenu>
      )}
      <div v-if={editor}>
        {editor && (
          <div className="w-full absolute bottom-0 hidden sm:flex flex-col justify-center items-center py-3 left-0 z-10">
            <div
              className={`w-fit ${
                editable ? 'opacity-100' : 'opacity-0 pointer-events-none'
              } border-[1.5px] border-border rounded-xl bg-background p-2 transition-all duration-300`}
            >
              {promptInput}
              <div className="toolbar w-fit flex items-center gap-2 flex-shrink-0 z-20">
                <Button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  disabled={!editor.can().chain().focus().toggleBold().run()}
                  variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                  className="h-fit w-fit flex items-center justify-center p-2"
                >
                  <Bold className="h-5 w-5 scale-[.85]" />
                </Button>
                <Button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  disabled={!editor.can().chain().focus().toggleItalic().run()}
                  variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                  className="h-fit w-fit flex items-center justify-center p-2"
                >
                  <Italic className="h-5 w-5 scale-[.85]" />
                </Button>
                <Button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  disabled={
                    !editor.can().chain().focus().toggleUnderline().run()
                  }
                  variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
                  className="h-fit w-fit flex items-center justify-center p-2"
                >
                  <UnderlineIcon className="h-5 w-5 scale-[.85]" />
                </Button>
                <Button
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  disabled={!editor.can().chain().focus().toggleStrike().run()}
                  variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
                  className="h-fit w-fit flex items-center justify-center p-2"
                >
                  <Strikethrough className="h-5 w-5 scale-[.85]" />
                </Button>
                <Separator orientation="vertical" className="h-7" />
                <Button
                  onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                  }
                  variant={
                    editor.isActive('heading', { level: 1 })
                      ? 'secondary'
                      : 'ghost'
                  }
                  className="h-fit w-fit flex items-center justify-center p-2"
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
                  className="h-fit w-fit flex items-center justify-center p-2"
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
                  className="h-fit w-fit flex items-center justify-center p-2"
                >
                  <Heading3 className="h-5 w-5" />
                </Button>

                <Separator orientation="vertical" className="h-7" />
                <Button
                  onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  variant={
                    editor.isActive('orderedList') ? 'secondary' : 'ghost'
                  }
                  className="h-fit w-fit flex items-center justify-center p-2"
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
                  className="h-fit w-fit flex items-center justify-center p-2"
                >
                  <List className="h-5 w-5" />
                </Button>
                <Separator orientation="vertical" className="h-7" />
                <Button
                  onClick={() => editor.chain().focus().toggleCode().run()}
                  disabled={!editor.can().chain().focus().toggleCode().run()}
                  variant={editor.isActive('code') ? 'secondary' : 'ghost'}
                  className="h-fit w-fit flex items-center justify-center p-2"
                >
                  <Code className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
                  className="h-fit w-fit flex items-center justify-center p-2"
                >
                  <CodeBlock />
                </Button>
                <Separator orientation="vertical" className="h-7" />
                {/* undo and redo */}
                <Button
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().chain().focus().undo().run()}
                  variant="ghost"
                  className="h-fit w-fit flex items-center justify-center p-2"
                >
                  <Undo className="h-5 w-5" />
                </Button>
                {/* redo */}
                <Button
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().chain().focus().redo().run()}
                  variant="ghost"
                  className="h-fit w-fit flex items-center justify-center p-2"
                >
                  <Redo className="h-5 w-5" />
                </Button>
                <Button
                  className="h-fit w-fit flex items-center justify-center p-2"
                  style={{
                    background:
                      'linear-gradient(310deg, #1A9CDC -16.15%, #8C65BA 70.75%)',
                  }}
                  onClick={() => {
                    setShowPromptInput(!showPromptInput);
                    setPrompt('');
                  }}
                >
                  <Star
                    className={`${showPromptInput ? 'rotate-90' : 'rotate-0'}`}
                  />
                </Button>
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
