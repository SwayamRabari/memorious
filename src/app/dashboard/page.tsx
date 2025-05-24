'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/ui/themetoggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Fuse from 'fuse.js';
import TextAreaAutosize from 'react-textarea-autosize';
import {
  Search,
  Lock,
  LockOpen,
  Plus,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  LogOut,
  Trash,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Loader from '@/components/ui/loader';
import Logo from '@/components/ui/logo';
import debounce from 'lodash.debounce';
import Tiptap from '@/components/editor';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { useNoteStore } from '@/store/noteStore';
import { Note } from '@/lib/types';
import { toast } from 'sonner';

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Use store values and actions directly from noteStore
  const {
    notes,
    selectedNote,
    hasUnsavedChanges,
    searchQuery,
    canEdit,
    isSidebarOpen,
    fetchNotes,
    addNote,
    updateNote,
    selectNote,
    setHasUnsavedChanges,
    setSearchQuery,
    toggleCanEdit,
    toggleSidebar,
    saveNote,
    removeNote,
  } = useNoteStore();

  // Additional state for UI interactions that don't need to be in the global store
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [nextNoteToSelect, setNextNoteToSelect] = useState<any>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Fetch notes when authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      setIsLoadingNotes(true);
      fetchNotes(session?.user?.id).finally(() => {
        setIsLoadingNotes(false);
      });
    }
  }, [status, fetchNotes, session?.user?.id]);

  const handleSearchChange = useCallback(
    debounce((e) => setSearchQuery(e.target.value), 300),
    [setSearchQuery],
  );

  // Use a memoized filtered notes list
  const filteredNotes = useMemo(() => {
    if (!searchQuery) {
      return notes;
    }
    const fuse = new Fuse(notes, {
      keys: ['title'],
      threshold: 0.5,
    });
    const result = fuse.search(searchQuery);
    return result.map(({ item }) => item);
  }, [searchQuery, notes]);

  const handleSelectNote = (note: Note) => {
    if (hasUnsavedChanges) {
      setNextNoteToSelect(note);
      setIsAlertDialogOpen(true);
    } else {
      selectNote(note);
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        toggleSidebar();
      }
    }
  };

  const handleSaveChanges = async () => {
    const toastId = toast.loading('Saving changes...');
    try {
      await saveNote(session?.user?.id);
      toast.dismiss(toastId);
    } catch (error) {
      toast.error('Failed to save changes.', { id: toastId });
    }
    setIsAlertDialogOpen(false);
    if (nextNoteToSelect) {
      selectNote(nextNoteToSelect);
      setNextNoteToSelect(null);
    }
  };

  const handleDiscardChanges = () => {
    setHasUnsavedChanges(false);
    setIsAlertDialogOpen(false);
    if (nextNoteToSelect) {
      selectNote(nextNoteToSelect);
      setNextNoteToSelect(null);
    }
  };

  const handleDeleteNote = async () => {
    setIsDeleteDialogOpen(false);
    await removeNote();
  };

  const handleTitleChange = (e: { target: { value: any } }) => {
    if (!selectedNote) return;
    updateNote({ ...selectedNote, title: e.target.value });
    setHasUnsavedChanges(true);
  };

  const handleContentChange = (content: string) => {
    if (!selectedNote) return;
    updateNote({ ...selectedNote, content });
    setHasUnsavedChanges(true);
  };

  const createNewNote = () => {
    if (hasUnsavedChanges) {
      setNextNoteToSelect({
        id: `temp-${Date.now()}`,
        title: '',
        content: '',
      });
      setIsAlertDialogOpen(true);
      return;
    }

    const newNote = {
      id: `temp-${Date.now()}`,
      title: '',
      content: '',
    };

    addNote(newNote);
    selectNote(newNote);

    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      toggleSidebar();
    }

    if (!canEdit) {
      toggleCanEdit();
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Save with Ctrl+S or Cmd+S
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (hasUnsavedChanges) {
          saveNote(session?.user?.id);
        }
      }

      // Delete with Delete key
      if (event.key.toLowerCase() === 'delete') {
        event.preventDefault();
        if (selectedNote && !selectedNote.id.startsWith('temp-')) {
          setIsDeleteDialogOpen(true);
        }
      }

      // Toggle sidebar with Ctrl+\ or Cmd+\
      if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    hasUnsavedChanges,
    selectedNote,
    toggleSidebar,
    saveNote,
    session?.user?.id,
  ]);

  // Warn about unsaved changes before unload
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

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="h-screen w-screen flex items-center justify-center text text-3xl font-semibold">
        <Loader />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!session) {
    return null;
  }

  // Create a skeleton UI component for notes
  const NotesSkeleton = () => (
    <div className="flex flex-col gap-1 w-full">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-10 w-full rounded-md animate-pulse bg-secondary/50 flex items-center px-3"
        >
          <div className="h-5 w-5 rounded-md bg-secondary/80 mr-2"></div>
          <div className="h-4 w-3/4 bg-secondary/80 rounded"></div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-svh w-screen transition-colors duration-150">
        {/* Mobile header */}
        <div className="header border-b border-border flex lg:hidden justify-between items-center w-full p-5">
          <div className="flex gap-5">
            <Button
              variant={'secondary'}
              className="h-10 w-10"
              onClick={toggleSidebar}
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
              onClick={() => handleSaveChanges()}
              disabled={!hasUnsavedChanges}
            >
              <Save className="h-5 w-5 flex-shrink-0" />
            </Button>
            <Button
              variant="destructive"
              className="h-10 w-10"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={!selectedNote || selectedNote.id.startsWith('temp-')}
            >
              <Trash className="h-5 w-5 flex-shrink-0" />
            </Button>
            <Button
              className="h-10 w-10"
              variant={'secondary'}
              onClick={toggleCanEdit}
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
          {/* Sidebar */}
          <div
            className={`sidebar absolute lg:relative h-full ${
              isSidebarOpen ? 'w-[80%] sm:w-[18rem] ' : 'w-0 border-r-0'
            } overflow-hidden bg-background z-50 flex-shrink-0 border-r flex flex-col transition-all duration-500 text-nowrap flex-nowrap`}
          >
            <div className="flex flex-col gap-5 p-5 border-b border-border">
              <div>
                <Button
                  variant="secondary"
                  className="justify-start w-full text-[1rem] px-3"
                  onClick={createNewNote}
                >
                  <Plus className="h-5 w-5 mr-2 stroke-[2px] flex-shrink-0" />
                  New Note
                </Button>
              </div>
              <div>
                <div className="h-10 rounded-md border-[1.5px] border-border px-3 flex justify-start items-center">
                  <Search className="h-5 w-5 scale-95 mr-2 text-zinc-500 stroke-[2px] flex-shrink-0" />
                  <div>
                    <Input
                      placeholder="Search"
                      className="w-full bg-transparent p-0 text-[1rem] placeholder-secondary border-none focus:border-none focus:ring-0"
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes list */}
            <ScrollArea className="flex-1 px-5">
              <div className="py-5">
                {isLoadingNotes ? (
                  <NotesSkeleton />
                ) : (
                  <div className="flex flex-col gap-1 cursor-pointer">
                    {filteredNotes
                      .filter((note) => note && note.id)
                      .map(
                        (note, index) =>
                          !note.id.startsWith('temp-') && (
                            <div
                              key={note.id || index}
                              onClick={() => handleSelectNote(note)}
                              className={`noteitem group relative h-10 w-full rounded-md grid grid-flow-col items-center justify-start px-3 text-[1rem] font-semibold hover:bg-secondary overflow-hidden ${
                                selectedNote?.id === note.id
                                  ? 'bg-secondary'
                                  : ''
                              }`}
                            >
                              <FileText className="h-5 w-5 mr-2 stroke-2 flex-shrink-0" />
                              <div className="text-nowrap overflow-hidden">
                                {note.title || 'Untitled'}
                              </div>
                              <div
                                className={`shadowcover transition-all absolute bg-gradient-to-r ${
                                  selectedNote?.id === note.id
                                    ? 'from-transparent to-secondary'
                                    : 'from-transparent to-background'
                                } w-10 h-full right-3 top-0 group-hover:from-transparent group-hover:to-secondary`}
                              ></div>
                            </div>
                          ),
                      )}{' '}
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* User info section */}
            <div className="border-t border-border p-5 relative flex items-center">
              <div className="h-fit w-full flex justify-normal items-center gap-3 relative overflow-hidden">
                <div className="bg-gradient-to-r from-transparent to-background w-7 h-full absolute right-0"></div>
                <div className="bg-secondary p-3 rounded-md flex">
                  <div className="h-5 w-5 font-semibold text-[1.4rem] flex items-center justify-center">
                    {session?.user?.name?.[0]?.toUpperCase() || ''}
                  </div>
                </div>
                <div className="userinfo">
                  <div className="font-semibold text-[1rem] w-full">
                    {session?.user?.name}
                  </div>
                  <div className="text-muted-foreground text-[0.80rem] font-semibold">
                    {session?.user?.email}
                  </div>
                </div>
              </div>
              <Button
                className="h-10 w-10 bg-background hover:bg-background text-foreground"
                onClick={async () => {
                  const toastId = toast.loading('Signing out...');
                  await signOut({ callbackUrl: '/' });
                  toast.dismiss(toastId);
                }}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
              </Button>
            </div>
          </div>

          {/* Main content area */}
          <div className="mainsection w-full flex flex-col relative overflow-auto flex-shrink-0 flex-1">
            {/* Desktop header */}
            <div className="header hidden lg:flex justify-between items-center w-full p-5">
              <div className="flex gap-5">
                <Button
                  variant={'secondary'}
                  className="h-10 w-10"
                  onClick={toggleSidebar}
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
                  onClick={() => handleSaveChanges()}
                  disabled={!hasUnsavedChanges}
                >
                  <Save className="h-5 w-5 flex-shrink-0" />
                </Button>
                <Button
                  variant="destructive"
                  className="h-10 w-10"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={
                    !selectedNote || selectedNote.id.startsWith('temp-')
                  }
                >
                  <Trash className="h-5 w-5 flex-shrink-0" />
                </Button>
                <Button
                  className="h-10 w-10"
                  variant={'secondary'}
                  onClick={toggleCanEdit}
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

            {/* Note content or placeholder */}
            {selectedNote ? (
              <div
                className={`scrollarea overflow-auto flex-1 flex transition-transform duration-500 py-5 md:py-16
                ${isSidebarOpen ? 'opacity-30 sm:opacity-100' : 'opacity-100'} justify-center`}
              >
                <div
                  className={`editorsection w-full md:w-[80%] lg:w-[760px] px-5`}
                >
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
                        content={selectedNote?.content || ''}
                        editable={canEdit}
                        onContentChange={handleContentChange}
                      />
                    </Suspense>
                  </div>
                </div>
              </div>
            ) : (
              // Bookmark placeholder when no note is selected
              <div className="h-full w-full flex items-center justify-center">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100"
                    height="171"
                    viewBox="0 0 100 171"
                    fill="none"
                    style={{
                      height: '50%',
                    }}
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

      {/* Unsaved changes dialog */}
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

      {/* Delete confirmation dialog */}
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

export default Dashboard;
