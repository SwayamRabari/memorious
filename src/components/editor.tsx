'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Separator } from './ui/separator';
import CodeBlock from './icons/codeblock';
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
} from 'lucide-react';
import { Button } from './ui/button';
import ListItem from '@tiptap/extension-list-item';
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu';

const Tiptap = () => {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:ring-0 outline-none p-0 rounded-b-md h-fit text-[1.05rem] text-wrap font-medium flex flex-col gap-3',
      },
    },
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Start typing...' }),
      ListItem,
      BubbleMenuExtension.configure({
        element: document.querySelector('.bubble-menu') as HTMLElement,
      }),
    ],
    content: `
    <p><strong>Closures in JavaScript</strong></p><p>A closure in JavaScript is a function that has access to variables in its outer lexical environment, even after the outer function has returned. This is achieved due to the way JavaScript handles variable scoping and function execution.</p><p><strong>Key characteristics of closures:</strong></p><ul><li><p><strong>Lexical scoping:</strong> Variables are bound to their lexical context, meaning their scope is determined by where they are defined, not where they are used.</p></li><li><p><strong>Function scope:</strong> Functions create their own scope, and variables declared within a function are only accessible within that function and its nested functions.</p></li><li><p><strong>Closure creation:</strong> When a function is defined within another function, it creates a closure. The inner function has access to the variables of the outer function, even after the outer function has finished executing.</p></li></ul><p><strong>Example:</strong></p><p><strong>JavaScript</strong></p><pre><code>function outerFunction() {
  let x = 10;

  function innerFunction() {
    console.log(x); // Accesses x from the outer scope
  }

  return innerFunction;
}

let closure = outerFunction();
closure(); // Output: 10</code></pre><p>In this example, <code>innerFunction</code> is a closure that has access to the variable <code>x</code> from the <code>outerFunction</code>. Even after <code>outerFunction</code> returns, <code>closure</code> can still access and use <code>x</code>.</p><p><strong>Common use cases of closures:</strong></p><ul><li><p><strong>Creating private variables:</strong> Closures can be used to create private variables that are only accessible within a specific scope.</p></li><li><p><strong>Implementing modules:</strong> Closures can be used to create modules, which are self-contained units of code that can be reused in different parts of an application.</p></li><li><p><strong>Creating callback functions:</strong> Closures are often used to create callback functions that need to access variables from their outer scope.</p></li></ul><p>By understanding closures, you can write more efficient and expressive JavaScript code.</p>
    `,
  });

  return (
    <div spellCheck="false" className="w-full">
      {editor && (
        <BubbleMenu
          editor={editor}
          className="toolbar scale-90 bubble-menu flex bg-background p-[8px] border border-border rounded-[12px] gap-2"
        >
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
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            variant={editor.isActive('code') ? 'secondary' : 'ghost'}
            className="h-fit w-fit flex items-center justify-center p-2"
          >
            <Code className="h-5 w-5" />
          </Button>
        </BubbleMenu>
      )}
      <div v-if={editor}>
        {editor && (
          <div className="w-full absolute bottom-0 flex justify-center items-center py-3 left-0 z-10">
            <div className="bg-background border-[1.5px] border-border w-fit p-2 rounded-xl flex items-center gap-2 flex-shrink-0">
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
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
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
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
                className="h-fit w-fit flex items-center justify-center p-2"
              >
                <ListOrdered className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
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
            </div>
          </div>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
