'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import {
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Trash,
  LockOpen,
  Lock,
  Plus,
  Search,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import TextAreaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModeToggle } from '@/components/ui/themetoggle';
import Loader from '@/components/ui/loader';
import Logo from '@/components/ui/logo';
import Tiptap from '@/components/editor';

interface Note {
  id: string;
  title: string;
  content: string;
}

const DemoPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [nextNoteToSelect, setNextNoteToSelect] = useState<Note | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [canEdit, setCanEdit] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // Notes are only saved in memory for this demo.
  // Your changes will be lost if you refresh or close the page.
  const [notesArray, setNotesArray] = useState<Note[]>([
    {
      id: 'welcome-note',
      title: 'Hey there 👋🏼',
      content: `<div class="welcome-container">
  <h1>Welcome to Memorious!</h1>
  
  <p class="intro">Your digital notebook for capturing ideas, organizing thoughts, and enhancing your writing experience.</p>
  
  <h2>📝 Getting Started</h2>
  <div class="feature-section">
    <p>Memorious makes note-taking simple and powerful:</p>
    <ul>
      <li><strong>Create notes</strong> - Click the "New Note" button or use our sidebar navigation</li>
      <li><strong>Rich formatting</strong> - Style your text with our intuitive editor toolbar</li>
      <li><strong>Instant search</strong> - Find your notes quickly with our powerful search function</li>
    </ul>
  </div>

  <h2>🎨 Customize Your Experience</h2>
  <div class="feature-section">
    <p>Make Memorious work for you:</p>
    <ul>
      <li><strong>Dark/Light mode</strong> - Toggle between themes using the mode switch in the toolbar</li>
      <li><strong>Focus mode</strong> - Hide the sidebar for distraction-free writing</li>
      <li><strong>Lock editing</strong> - Use the lock icon to prevent accidental changes to important notes</li>
      <li><strong>Responsive layout</strong> - Enjoy a seamless experience on any device</li>
    </ul>
  </div>

  <h2>🤖 AI-Powered Writing</h2>
  <div class="feature-section">
    <p>Enhance your writing with our AI assistant:</p>
    <ul>
      <li><strong>Content generation</strong> - Get help drafting content for your notes</li>
      <li><strong>Creative ideas</strong> - Overcome writer's block with AI-generated content</li>
      <li><strong>Format results</strong> - Decide how the response should be</li>
    </ul>
  </div>

  <h2>💡 Try These Prompts</h2>
  <div class="example-container">
    <div class="example">
      <h3>✏️ Draft Content</h3>
      <p class="prompt">"Write a product description for my new eco-friendly water bottle"</p>
      <p class="result">Get a professionally written first draft to jumpstart your work.</p>
    </div>
    
    <div class="example">
      <h3>🔄 Rewrite & Polish</h3>
      <p class="prompt">"Rewrite this paragraph to sound more professional"</p>
      <p class="result">Instantly improve the tone and clarity of your writing.</p>
    </div>
    
    <div class="example">
      <h3>📋 Generate Structure</h3>
      <p class="prompt">"Create an outline for a presentation about renewable energy"</p>
      <p class="result">Quickly organize your thoughts with AI-generated frameworks.</p>
    </div>
  </div>

  <h2>📁 Organize Your Way</h2>
  <p>Create as many notes as you need and find them quickly with our powerful search feature. Perfect for projects, ideas, meeting notes, and more!</p>
  <p>Note: This is demo mode so changes will not be saved for future sessions.</p>
</div>`,
    },
  ]);
  const [selectedNoteContent, setSelectedNoteContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(notesArray[0]);

  const handleSearchChange = useCallback(
    debounce((e) => setSearchQuery(e.target.value), 300),
    [],
  );

  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notesArray;
    const fuse = new Fuse(notesArray, { keys: ['title'], threshold: 0.5 });
    return fuse.search(searchQuery).map(({ item }) => item);
  }, [searchQuery, notesArray]);

  useEffect(() => {
    if (selectedNote) {
      setSelectedNoteContent(selectedNote.content);
    } else {
      setSelectedNoteContent('');
    }
  }, [selectedNote]);

  const handleSelectNote = (note: Note) => {
    if (hasUnsavedChanges) {
      setNextNoteToSelect(note);
      setIsAlertDialogOpen(true);
    } else {
      setSelectedNote(note);
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        setIsSidebarOpen(false);
      }
    }
  };

  const handleSaveChanges = async () => {
    await saveNote();
    setIsAlertDialogOpen(false);
    if (nextNoteToSelect) {
      setSelectedNote(nextNoteToSelect);
      setNextNoteToSelect(null);
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    setIsAlertDialogOpen(false);
    if (nextNoteToSelect) {
      setSelectedNote(nextNoteToSelect);
      setNextNoteToSelect(null);
    }
  };

  const saveNote = useCallback(async () => {
    try {
      if (!selectedNote) return;
      if (selectedNote.id.startsWith('temp-')) {
        const newId = `${Date.now()}`;
        const newNote: Note = { ...selectedNote, id: newId };
        setNotesArray([
          newNote,
          ...notesArray.filter((n) => !n.id.startsWith('temp-')),
        ]);
        setSelectedNote(newNote);
      } else {
        setNotesArray(
          notesArray.map((note) =>
            note.id === selectedNote.id ? selectedNote : note,
          ),
        );
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error('Failed to save note.');
    }
  }, [selectedNote, notesArray]);

  const deleteNote = useCallback(() => {
    if (!selectedNote) return;
    setIsDeleteDialogOpen(true);
  }, [selectedNote]);

  const handleDeleteNote = useCallback(async () => {
    if (!selectedNote) return;
    setIsDeleteDialogOpen(false);
    try {
      const newNotes = notesArray.filter((note) => note.id !== selectedNote.id);
      setNotesArray(newNotes);
      setSelectedNote(null);
      setHasUnsavedChanges(false);
    } catch {
      toast.error('Failed to delete note.', { id: 'delete-note' });
    }
  }, [selectedNote, notesArray]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (hasUnsavedChanges) {
          saveNote();
        }
      }
      if (event.key.toLowerCase() === 'delete') {
        event.preventDefault();
        if (selectedNote) {
          deleteNote();
        }
      }
      if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
        event.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveNote, deleteNote, hasUnsavedChanges, selectedNote, isSidebarOpen]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleTitleChange = (e: { target: { value: string } }) => {
    if (!selectedNote) return;
    const updatedNote = { ...selectedNote, title: e.target.value };
    setSelectedNote(updatedNote);
    setHasUnsavedChanges(true);
  };

  return (
    <>
      <div className="flex flex-col h-screen w-screen transition-colors duration-150">
        <div className="header border-b border-border flex lg:hidden justify-between items-center w-full p-5">
          <div className="flex gap-5">
            <Button
              variant={'secondary'}
              className="h-10 w-10"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-5 w-5 flex-shrink-0" />
              ) : (
                <PanelLeftOpen className="h-5 w-5 flex-shrink-0" />
              )}
            </Button>
          </div>
          <div className="flex justify-center items-center gap-5">
            <Button
              variant={'secondary'}
              className="h-10 w-10"
              onClick={saveNote}
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-5 w-5 flex-shrink-0" />
            </Button>
            <Button
              variant="destructive"
              className="h-10 w-10"
              onClick={deleteNote}
              disabled={!selectedNote || selectedNote.id.startsWith('temp-')}
            >
              <Trash className="h-5 w-5 flex-shrink-0" />
            </Button>
            <Button
              className="h-10 w-10"
              variant={'secondary'}
              onClick={() => setCanEdit((prev) => !prev)}
            >
              {canEdit ? (
                <LockOpen className="h-5 w-5 flex-shrink-0" />
              ) : (
                <Lock className="h-5 w-5 flex-shrink-0" />
              )}
            </Button>
            <ModeToggle />
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden relative">
          <div
            className={`sidebar absolute lg:relative h-full ${
              isSidebarOpen ? 'w-[80%] sm:w-[18rem]' : 'w-0 border-r-0'
            } overflow-hidden bg-background z-50 flex-shrink-0 border-r flex flex-col transition-all duration-500 text-nowrap flex-nowrap`}
          >
            <div className="flex flex-col gap-5 p-5 border-b border-border">
              <div>
                <Button
                  variant="secondary"
                  className="justify-start w-full text-[1rem] px-3"
                  onClick={() => {
                    const newNote = {
                      id: `temp-${Date.now()}`,
                      title: '',
                      content: '',
                    };
                    setSelectedNote(newNote);
                    setCanEdit(true);
                    if (
                      typeof window !== 'undefined' &&
                      window.innerWidth < 640
                    ) {
                      setIsSidebarOpen(false);
                    }
                  }}
                >
                  <Plus className="h-5 w-5 mr-2 stroke-[2px] flex-shrink-0" />
                  New Note
                </Button>
              </div>
              <div>
                <div className="h-10 rounded-md border-[1.5px] border-border px-3 flex items-center">
                  <Search className="h-5 w-5 scale-95 mr-2 text-zinc-500 stroke-[2px] flex-shrink-0" />
                  <Input
                    placeholder="Search"
                    className="w-full bg-transparent p-0 text-[1rem] placeholder-secondary border-none focus:border-none focus:ring-0"
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>
            <ScrollArea className="flex-1 px-5">
              <div className="py-5">
                <div className="flex flex-col gap-1 cursor-pointer">
                  {filteredNotes.map((note) =>
                    !note.id.startsWith('temp-') ? (
                      <div
                        key={note.id}
                        onClick={() => handleSelectNote(note)}
                        className={`noteitem group relative h-10 w-full rounded-md grid grid-flow-col items-center justify-start px-3 text-[1rem] font-semibold hover:bg-secondary ${
                          selectedNote?.id === note.id ? 'bg-secondary' : ''
                        }`}
                      >
                        <FileText className="h-5 w-5 mr-2 flex-shrink-0" />
                        {note.title || 'Untitled'}
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
          <div className="mainsection w-full flex flex-col relative overflow-auto flex-shrink-0 flex-1">
            <div className="header hidden lg:flex justify-between items-center w-full p-5">
              <div className="flex gap-5">
                <Button
                  variant={'secondary'}
                  className="h-10 w-10"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  {isSidebarOpen ? (
                    <PanelLeftClose className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <PanelLeftOpen className="h-5 w-5 flex-shrink-0" />
                  )}
                </Button>
                <Logo />
              </div>
              <div className="flex justify-center items-center gap-5">
                <Button
                  variant={'secondary'}
                  className="h-10 w-10"
                  onClick={saveNote}
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="h-5 w-5 flex-shrink-0" />
                </Button>
                <Button
                  variant="destructive"
                  className="h-10 w-10"
                  onClick={deleteNote}
                  disabled={
                    !selectedNote || selectedNote.id.startsWith('temp-')
                  }
                >
                  <Trash className="h-5 w-5 flex-shrink-0" />
                </Button>
                <Button
                  className="h-10 w-10"
                  variant={'secondary'}
                  onClick={() => setCanEdit((prev) => !prev)}
                >
                  {canEdit ? (
                    <LockOpen className="h-5 w-5 flex-shrink-0" />
                  ) : (
                    <Lock className="h-5 w-5 flex-shrink-0" />
                  )}
                </Button>
                <ModeToggle />
              </div>
            </div>
            {selectedNote ? (
              <div
                className={`scrollarea overflow-auto flex-1 flex transition-transform duration-500 py-5 md:py-16 ${
                  isSidebarOpen ? 'opacity-30 sm:opacity-100' : 'opacity-100'
                } justify-center`}
              >
                <div className="editorsection w-full md:w-[80%] lg:w-[760px] px-8">
                  <div
                    className="title w-full h-fit font-bold text-3xl sm:text-5xl text-balance mb-2"
                    style={{ lineHeight: '1.2' }}
                  >
                    <TextAreaAutosize
                      className="w-full titlefield bg-transparent outline-none text-balance font-bold text-3xl sm:text-5xl placeholder:text-muted-foreground resize-none"
                      value={selectedNote?.title || ''}
                      placeholder="Untitled"
                      readOnly={!canEdit}
                      style={{ lineHeight: '1.2' }}
                      onChange={handleTitleChange}
                    />
                  </div>
                  <div className="w-full pb-40 flex-1">
                    <Suspense fallback={<Loader />}>
                      <Tiptap
                        content={selectedNoteContent}
                        editable={canEdit}
                        onContentChange={(content: string) => {
                          setSelectedNoteContent(content);
                          setSelectedNote({ ...selectedNote!, content });
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100"
                    height="171"
                    viewBox="0 0 100 171"
                    fill="none"
                    style={{ height: '50%' }}
                  >
                    <path
                      d="M100 0H0V171L50 143L100 171V0Z"
                      className="fill-secondary"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-base font-medium">
            You have unsaved changes. Do you want to save them before moving?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleDiscardChanges}>
              {`Don't Save`}
            </Button>
            <Button variant="secondary" onClick={handleSaveChanges}>
              Save
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-base font-medium">
            Are you sure you want to delete this note?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DemoPage;
