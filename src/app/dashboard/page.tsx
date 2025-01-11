'use client';

import { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/ui/themetoggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Fuse from 'fuse.js';
import { toast } from 'sonner';
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

const Dashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [nextNoteToSelect, setNextNoteToSelect] = useState<Note | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  interface Note {
    id: string;
    title: string;
    content: string;
  }

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notesArray, setNotesArray] = useState<Note[]>([]);
  const [selectedNoteContent, setSelectedNoteContent] = useState<string>('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  useEffect(() => {
    const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobileDevice) {
      setCanEdit(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotes();
    }
  }, [status]);

  const handleSearchChange = useCallback(
    debounce((e) => setSearchQuery(e.target.value), 300),
    [],
  );

  const filteredNotes = useMemo(() => {
    if (!searchQuery) {
      return notesArray;
    }
    const fuse = new Fuse(notesArray, {
      keys: ['title'],
      threshold: 0.5,
    });
    const result = fuse.search(searchQuery);
    return result.map(({ item }) => item);
  }, [searchQuery, notesArray]);

  const toggleEdit = useCallback(() => {
    setCanEdit((prevCanEdit) => !prevCanEdit);
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes/user/${session?.user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      setNotesArray(data && data.notes);
      console.log('Fetched notes:', data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes.');
    }
  };

  useEffect(() => {
    if (selectedNote) {
      setSelectedNoteContent(selectedNote.content);
    } else {
      setSelectedNoteContent('');
    }
  }, [selectedNote]);

  const handleSelectNote = (note: any) => {
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

      if (selectedNote.id && !selectedNote.id.startsWith('temp-')) {
        toast.loading('Saving...', {
          id: 'save-note',
        });
        const response = await fetch(`/api/notes/${selectedNote.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: selectedNote.title,
            content: selectedNote.content,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to update note');
        }
        const data = await response.json();
        setNotesArray(
          notesArray.map((note) =>
            note.id === data.note.id ? data.note : note,
          ),
        );
        setHasUnsavedChanges(false);
        toast.dismiss('save-note');
      } else {
        toast.loading('Saving...', {
          id: 'create-note',
        });

        const response = await fetch(`/api/notes/${session?.user?.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session?.user?.id,
            title: selectedNote.title,
            content: selectedNote.content,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to create note');
        }
        const data = await response.json();
        setSelectedNote(data.note);
        setNotesArray([
          data.note,
          ...notesArray.filter((note) => !note.id.startsWith('temp-')),
        ]);
        setHasUnsavedChanges(false);
        toast.dismiss('create-note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note.');
    }
  }, [selectedNote, notesArray, hasUnsavedChanges]);

  const deleteNote = useCallback(() => {
    if (!selectedNote) return;
    setIsDeleteDialogOpen(true);
  }, [selectedNote]);

  const handleDeleteNote = useCallback(async () => {
    if (!selectedNote) return;
    setIsDeleteDialogOpen(false);

    toast.loading('Deleting...', {
      id: 'delete-note',
    });

    try {
      const response = await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      setNotesArray(notesArray.filter((note) => note.id !== selectedNote.id));
      setSelectedNote(null);
      setHasUnsavedChanges(false);
      toast.dismiss('delete-note');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note.', {
        id: 'delete-note',
      });
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
      //delete key to delete note
      if (event.key.toLowerCase() === 'delete') {
        event.preventDefault();
        if (selectedNote) {
          deleteNote();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [saveNote, deleteNote, hasUnsavedChanges, selectedNote]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleTitleChange = (e: { target: { value: any } }) => {
    if (!selectedNote) return;
    const updatedNote = { ...selectedNote, title: e.target.value };
    setSelectedNote(updatedNote);
    setHasUnsavedChanges(true);
  };

  if (status === 'loading') {
    return (
      <div className="h-screen w-screen flex items-center justify-center text text-3xl font-semibold">
        <Loader />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col h-screen w-screen transition-colors duration-150">
        <div className="header border-b border-border flex lg:hidden justify-between items-center w-full p-5">
          <div className="flex gap-5">
            <Button
              variant={'secondary'}
              className="h-10 w-10"
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
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
              onClick={toggleEdit}
              disabled={!canEdit}
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
              isSidebarOpen ? 'w-[80%] sm:w-[18rem] ' : 'w-0 border-r-0'
            } overflow-hidden bg-background z-50 flex-shrink-0 border-r flex flex-col transition-all duration-500 text-nowrap flex-nowrap`}
          >
            <div className="flex flex-col gap-5 p-5 border-b border-border">
              <div>
                <Button
                  variant="secondary"
                  className="justify-start w-full text-[1rem] px-3"
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      setNextNoteToSelect({
                        id: `temp-${Date.now()}`,
                        title: '',
                        content: '',
                      });
                      setIsAlertDialogOpen(true);
                      return;
                    }

                    setSelectedNote({
                      id: `temp-${Date.now()}`,
                      title: '',
                      content: '',
                    });

                    if (
                      typeof window !== 'undefined' &&
                      window.innerWidth < 640
                    ) {
                      setIsSidebarOpen(false);
                    }
                    setCanEdit(true);
                  }}
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
            <ScrollArea className="flex-1 px-5">
              <div className="py-5">
                <div className="flex flex-col gap-1 cursor-pointer">
                  {filteredNotes.map(
                    (note, index) =>
                      !note.id.startsWith('temp-') && (
                        <div
                          key={note.id || index}
                          onClick={() => handleSelectNote(note)}
                          className={`noteitem group relative  h-10 w-full rounded-md grid grid-flow-col items-center justify-start px-3 text-[1rem] font-semibold hover:bg-secondary overflow-hidden ${
                            selectedNote?.id === note.id ? 'bg-secondary' : ''
                          }`}
                        >
                          <FileText className="h-5 w-5 mr-2 stroke-2 flex-shrink-0" />
                          <div className="text-nowrap  overflow-hidden">
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
                  )}
                </div>
              </div>
            </ScrollArea>
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
              <Button className="h-10 w-10 bg-background hover:bg-background text-foreground">
                <LogOut
                  className="h-5 w-5 flex-shrink-0"
                  onClick={() =>
                    signOut({
                      callbackUrl: '/',
                    })
                  }
                />
              </Button>
            </div>
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
                  onClick={toggleEdit}
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
                className={`scrollarea  overflow-auto flex-1 flex transition-transform duration-500 py-16
              ${
                isSidebarOpen ? 'opacity-30 sm:opacity-100' : 'opacity-100'
              } justify-center`}
              >
                <div
                  className={`editorsection w-full md:w-[80%] lg:w-[760px] px-8`}
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
              // loader
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

export default Dashboard;
