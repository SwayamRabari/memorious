import { create } from 'zustand';

interface EditorState {
  content: string;
  prompt: string;
  responseLoading: boolean;
  showPromptInput: boolean;
  lengthValue: number[];
  lengthLabel: string;
  structure: string;
  tone: string;

  // actions
  setContent: (content: string) => void;
  setPrompt: (prompt: string) => void;
  setResponseLoading: (loading: boolean) => void;
  togglePromptInput: () => void;
  setLengthValue: (value: number[]) => void;
  setLengthLabel: (label: string) => void;
  setStructure: (structure: string) => void;
  setTone: (tone: string) => void;
  resetPrompt: () => void;

  // api methods
  generateContent: () => Promise<void>;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  content: '',
  prompt: '',
  responseLoading: false,
  showPromptInput: false,
  lengthValue: [50],
  lengthLabel: 'Medium',
  structure: 'normal',
  tone: 'normal',

  setContent: (content) => set({ content }),
  setPrompt: (prompt) => set({ prompt }),
  setResponseLoading: (loading) => set({ responseLoading: loading }),
  togglePromptInput: () =>
    set((state) => ({
      showPromptInput: !state.showPromptInput,
      prompt: !state.showPromptInput ? state.prompt : '',
    })),
  setLengthValue: (value) => set({ lengthValue: value }),
  setLengthLabel: (label) => set({ lengthLabel: label }),
  setStructure: (structure) => set({ structure }),
  setTone: (tone) => set({ tone }),
  resetPrompt: () => set({ prompt: '' }),

  generateContent: async () => {
    const { prompt } = get();

    if (!prompt) return;

    set({ responseLoading: true });

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt:
            prompt +
            '\n\nAdditional context: do not include main heading for the generated content. \n Make answer detailed and well structured.',
        }),
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Failed to generate content:', error);
    } finally {
      set({
        responseLoading: false,
        prompt: '',
      });
    }
  },
}));
