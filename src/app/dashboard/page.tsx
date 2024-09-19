'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/ui/themetoggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Tiptap from '@/components/editor';
import {
  Search,
  Plus,
  FileText,
  User,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Loader from '@/components/ui/loader';
import Logo from '@/components/ui/logo';

const Dashboard = () => {
  const { data: session, status }: any = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedNote, setSelectedNote] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // notesList array real life examples
  const notesArray = [
    { title: 'Closures in JavaScript' },
    { title: 'Understanding React Components' },
    { title: 'State and Props in React' },
    { title: 'JavaScript ES6 Features' },
    { title: 'Building a Todo App with React' },
    { title: 'Introduction to TypeScript' },
    { title: 'Using Hooks in React' },
    { title: 'Managing State with Redux' },
    { title: 'React Router for Navigation' },
    { title: 'Deploying React Applications' },
  ];

  useEffect(() => {
    console.log('Status:', status);
    console.log('Session:', session);

    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

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

  const filteredNotes = notesArray.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen transition-colors duration-150">
      <div
        className={`sidebar ${
          isSidebarOpen ? 'w-[18rem]' : 'w-0 border-r-0'
        } overflow-hidden flex-shrink-0 border-r flex flex-col transition-all duration-500 text-nowrap flex-nowrap`}
      >
        <div className="flex flex-col gap-5 p-5 border-b border-border">
          {/* New Note Button */}
          <div>
            <Button
              variant="secondary"
              className="justify-start w-full text-[1rem] px-3"
              onClick={() => {
                // console.log innerHtml of the editor
                console.log(
                  'Inner HTML:',
                  document.querySelector('.ProseMirror')?.innerHTML
                );
              }}
            >
              <Plus className="h-5 w-5 mr-2 stroke-[2px] flex-shrink-0" />
              New Note
            </Button>
          </div>
          {/* Search Bar */}
          <div>
            <div className="h-10 rounded-md border-[1.5px] border-border px-3 flex justify-start items-center">
              <Search className="h-5 w-5 scale-95 mr-2 text-zinc-500 stroke-[2px] flex-shrink-0" />
              <div>
                <Input
                  placeholder="Search"
                  className="w-full bg-transparent p-0 text-[1rem] placeholder-secondary border-none focus:border-none focus:ring-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        {/* Notes Container */}
        <ScrollArea className="flex-1 px-5">
          <div className="py-5">
            <div className="flex flex-col gap-1 cursor-pointer">
              {
                // Notes List
                filteredNotes.map(({ title }, index) => (
                  // Note Item Mapping
                  <div
                    key={index}
                    onClick={() => setSelectedNote(index)}
                    className={`noteitem group relative  h-10 w-full rounded-md grid grid-flow-col items-center justify-start px-3 text-[1rem] font-semibold hover:bg-secondary overflow-hidden ${
                      selectedNote === index ? 'bg-secondary' : ''
                    }`}
                  >
                    <FileText className="h-5 w-5 mr-2 stroke-2 flex-shrink-0" />
                    <div className="text-nowrap  overflow-hidden">{title}</div>
                    {/* Shadow Cover */}
                    <div
                      className={`shadowcover transition-all absolute bg-gradient-to-r ${
                        selectedNote === index
                          ? 'from-transparent to-secondary'
                          : 'from-transparent to-background'
                      } w-10 h-full right-3 top-0 group-hover:from-transparent group-hover:to-secondary`}
                    ></div>
                  </div>
                ))
              }
            </div>
          </div>
        </ScrollArea>
        {/* User Info */}
        <div className="px-5 mb-5 border-t border-border pt-5">
          <div className="h-10 w-full rounded-md bg-secondary px-3 flex justify-start items-center">
            <User className="h-[22px] flex-shrink-0" />
            <div className="ml-2 text-[1rem] font-semibold">
              {session.user.name}
            </div>
          </div>
        </div>
      </div>
      {/* Main Section */}
      <div className="mainsection w-full flex flex-col relative overflow-auto flex-shrink-0 flex-1">
        <div className="header flex justify-between items-center w-full p-5">
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
          <ModeToggle />
        </div>
        <div className="scrollarea overflow-auto">
          <div
            className={`editorsection h-full ${
              isSidebarOpen ? 'px-24' : 'px-60'
            } py-14 flex flex-1 flex-col gap-6 transition-all duration-500`}
          >
            <div className="title w-full h-fit font-bold text-5xl leading-normal text-balance">
              {selectedNote !== null
                ? notesArray[selectedNote].title
                : 'Select a note'}
            </div>
            <div className="w-full pb-40">
              <Tiptap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
