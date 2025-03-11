import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from '../lib/types';

interface NoteState {
  notes: Note[];
  selectedNote: Note | null;
  hasUnsavedChanges: boolean;
  searchQuery: string;
  canEdit: boolean;
  isSidebarOpen: boolean;

  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  selectNote: (note: Note | null) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleCanEdit: () => void;
  toggleSidebar: () => void;

  // api methods
  fetchNotes: (userId: string | undefined) => Promise<void>;
  saveNote: (userId: string | undefined) => Promise<void>;
  removeNote: () => Promise<void>;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      selectedNote: null,
      hasUnsavedChanges: false,
      searchQuery: '',
      canEdit: true,
      isSidebarOpen: true,

      setNotes: (notes) => set({ notes }),
      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (updatedNote) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === updatedNote.id ? updatedNote : note,
          ),
          selectedNote:
            updatedNote.id === state.selectedNote?.id
              ? updatedNote
              : state.selectedNote,
        })),
      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          selectedNote:
            state.selectedNote?.id === id ? null : state.selectedNote,
        })),
      selectNote: (note) => set({ selectedNote: note }),
      setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      toggleCanEdit: () => set((state) => ({ canEdit: !state.canEdit })),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      fetchNotes: async (userId) => {
        try {
          const response = await fetch(`/api/notes/user/${userId}`);
          const data = await response.json();
          set({ notes: data.notes });
        } catch (error) {
          console.error('Failed to fetch notes:', error);
        }
      },

      saveNote: async (userId) => {
        const { selectedNote } = get();
        if (!selectedNote) return;

        // Updating an existing note
        if (selectedNote.id && !selectedNote.id.startsWith('temp-')) {
          // Backup the original note for rollback
          const originalNote = get().notes.find(
            (note) => note.id === selectedNote.id,
          );

          // Optimistically update the UI immediately
          set((state) => ({
            notes: state.notes.map((note) =>
              note.id === selectedNote.id ? selectedNote : note,
            ),
            hasUnsavedChanges: false,
          }));

          // Sync with the database in the background
          try {
            const response = await fetch(`/api/notes/${selectedNote.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: selectedNote.title,
                content: selectedNote.content,
              }),
            });
            if (!response.ok) throw new Error('Failed to update note');

            const data = await response.json();
            const updatedNote = data.note;
            // Update the state with the server response, if needed
            set((state) => ({
              notes: state.notes.map((note) =>
                note.id === updatedNote.id ? updatedNote : note,
              ),
              selectedNote: updatedNote,
            }));
            return updatedNote;
          } catch (error) {
            console.error('Background update failed:', error);
            // Rollback to the original note if the update fails
            if (originalNote) {
              set((state) => ({
                notes: state.notes.map((note) =>
                  note.id === originalNote.id ? originalNote : note,
                ),
                selectedNote: originalNote,
              }));
            }
            alert('Failed to update note. Please try again.');
          }
        } else {
          // Creating a new note

          // Create a temporary note for immediate UI update
          const tempId = `temp-${Date.now()}`;
          const tempNote = { ...selectedNote, id: tempId };
          set((state) => ({
            notes: [...state.notes, tempNote],
            selectedNote: tempNote,
            hasUnsavedChanges: false,
          }));

          // Sync with the database in the background
          try {
            const response = await fetch(`/api/notes/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                title: tempNote.title,
                content: tempNote.content,
              }),
            });
            if (!response.ok) throw new Error('Failed to create note');

            const data = await response.json();
            const newNote = data.note;
            // Replace the temporary note with the note from the server
            set((state) => ({
              notes: state.notes.map((note) =>
                note.id === tempId ? newNote : note,
              ),
              selectedNote: newNote,
            }));
            return newNote;
          } catch (error) {
            console.error('Background creation failed:', error);
            // Remove the temporary note if creation fails
            set((state) => ({
              notes: state.notes.filter((note) => note.id !== tempId),
              selectedNote: null,
            }));
            alert('Failed to create note. Please try again.');
          }
        }
      },
      removeNote: async () => {
        const { selectedNote } = get();
        if (!selectedNote || selectedNote.id.startsWith('temp-')) return;

        // Backup the note for potential rollback
        const noteToDelete = selectedNote;

        // Optimistically remove the note from the UI immediately
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== noteToDelete.id),
          selectedNote: null,
          hasUnsavedChanges: false,
        }));

        // Sync with the database in the background
        try {
          const response = await fetch(`/api/notes/${noteToDelete.id}`, {
            method: 'DELETE',
          });
          if (!response.ok) throw new Error('Failed to delete note');
        } catch (error) {
          console.error('Background deletion failed:', error);
          // Revert the deletion if the API call fails
          set((state) => ({
            notes: [noteToDelete, ...state.notes],
            selectedNote: noteToDelete,
          }));
          alert('Failed to delete note. Please try again.');
        }
      },
    }),
    {
      name: 'note-storage',
      partialize: (state) => ({
        notes: state.notes,
        isSidebarOpen: state.isSidebarOpen,
      }),
    },
  ),
);
