'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ModeToggle } from '@/components/ui/themetoggle';
import { Button } from '@/components/ui/button';
import { LockOpen, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Suspense } from 'react';
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
import debounce from 'lodash.debounce';

const Tiptap = dynamic(() => import('@/components/editor'), { ssr: false });

const notesArray = [
  { title: 'Closures in JavaScript' },
  { title: 'Understanding React Hooks' },
  { title: 'TypeScript Basics' },
  { title: 'Next.js Routing' },
  { title: 'State Management with Redux' },
];

const Dashboard = () => {
  const { data: session, status }: any = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const handleSearchChange = useCallback(
    debounce((e) => setSearchQuery(e.target.value), 300),
    []
  );

  const filteredNotes = useMemo(
    () =>
      notesArray.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery]
  );

  const toggleEdit = useCallback(() => {
    setCanEdit((prevCanEdit) => !prevCanEdit);
  }, []);

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
    <div className="flex flex-col h-screen w-screen transition-colors duration-150">
      <div className="header border-b border-border flex sm:hidden justify-between items-center w-full p-5">
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
      <div className="flex flex-1 overflow-hidden relative">
        <div
          className={`sidebar absolute sm:relative h-full ${
            isSidebarOpen ? 'w-[80%] sm:w-[18rem] ' : 'w-0 border-r-0'
          } overflow-hidden bg-background z-50 flex-shrink-0 border-r flex flex-col transition-all duration-500 text-nowrap flex-nowrap`}
        >
          <div className="flex flex-col gap-5 p-5 border-b border-border">
            <div>
              <Button
                variant="secondary"
                className="justify-start w-full text-[1rem] px-3"
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
                {filteredNotes.map(({ title }, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedNote(title);
                      if (
                        typeof window !== 'undefined' &&
                        window.innerWidth < 640
                      ) {
                        setIsSidebarOpen(false);
                      }
                    }}
                    className={`noteitem group relative  h-10 w-full rounded-md grid grid-flow-col items-center justify-start px-3 text-[1rem] font-semibold hover:bg-secondary overflow-hidden ${
                      selectedNote === title ? 'bg-secondary' : ''
                    }`}
                  >
                    <FileText className="h-5 w-5 mr-2 stroke-2 flex-shrink-0" />
                    <div className="text-nowrap  overflow-hidden">{title}</div>
                    <div
                      className={`shadowcover transition-all absolute bg-gradient-to-r ${
                        selectedNote === title
                          ? 'from-transparent to-secondary'
                          : 'from-transparent to-background'
                      } w-10 h-full right-3 top-0 group-hover:from-transparent group-hover:to-secondary`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
          <div className="mb-5 border-t border-border pt-5 px-5">
            <div className="h-fit w-full flex justify-normal items-center gap-3 relative overflow-hidden">
              <div className="bg-secondary p-3 rounded-md flex">
                <div className="h-5 w-5 font-semibold text-[1.4rem] flex items-center justify-center rounded">
                  {session.user.name[0].toUpperCase()}
                </div>
              </div>
              {/* add a gradient closure for overfloeing text! */}
              <div className="userinfo">
                <div
                  className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent pointer-events-none"
                  style={{ display: 'inline-block' }}
                ></div>
                <div className="font-semibold text-[1rem] w-full">
                  {session.user.name}
                </div>
                <div className="text-muted-foreground text-[0.80rem] font-semibold">
                  {session.user.email}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mainsection w-full flex flex-col relative overflow-auto flex-shrink-0 flex-1">
          <div className="header hidden sm:flex justify-between items-center w-full p-5">
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
          <div
            className={`scrollarea  overflow-auto flex-1 transition-all duration-500
              ${isSidebarOpen ? 'opacity-30 sm:opacity-100' : 'opacity-100'}`}
          >
            <div
              className={`editorsection h-full px-5 sm:px-10 ${
                isSidebarOpen ? 'lg:px-28 2xl:px-60' : 'lg:px-64 2xl:px-96'
              } py-5 sm:py-14 flex flex-1 flex-col gap-6 transition-all duration-500`}
            >
              <div
                className="title w-full h-fit font-bold text-5xl sm:text-5xl text-balance"
                style={{ lineHeight: '1.2' }}
              >
                <textarea
                  readOnly={!canEdit}
                  className="bg-transparent border-none focus:ring-0 w-full outline-none resize-none overflow-hidden -mb-4"
                  placeholder="Untitled"
                  value={selectedNote || ''}
                  rows={1}
                  onInput={(e) => {
                    (e.target as HTMLTextAreaElement).style.height = 'auto';
                    (e.target as HTMLTextAreaElement).style.height = `${
                      (e.target as HTMLTextAreaElement).scrollHeight
                    }px`;
                  }}
                />
              </div>
              <div className="w-full pb-40 flex-1">
                <Suspense fallback={<Loader />}>
                  <Tiptap content="" editable={canEdit} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
