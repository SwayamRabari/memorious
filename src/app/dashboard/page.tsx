'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ModeToggle } from '@/components/ui/themetoggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, FileText, User, PanelLeft } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Loader from '@/components/ui/loader';
import Logo from '@/components/ui/logo';

const Dashboard = () => {
  const { data: session, status }: any = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);

  const htmlContent = ``;

  const noteTitles = [
    'Meeting Agenda Discussion',
    'Closure in JS',
    'Project Proposal',
    'Task Tracker',
    'Recipe Ideas',
    'Travel Itinerary',
    'Meeting Agenda',
    'Shopping List',
    'Project Proposal',
    'Task Tracker',
    'Recipe Ideas',
    'Travel Itinerary',
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
            >
              <Plus className="h-5 w-5 mr-2 stroke-[2px] flex-shrink-0" />
              New Note
            </Button>
          </div>
          {/* Serach Bar */}
          <div>
            <div className="h-10 rounded-md border-[1.5px] border-border px-3 flex justify-start items-center">
              <Search className="h-5 w-5 scale-95 mr-2 text-zinc-500 stroke-[2px] flex-shrink-0" />
              <div>
                <Input
                  placeholder="Search"
                  className="w-full bg-transparent p-0 text-[1rem] placeholder-secondary border-none focus:border-none focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Notes Container */}
        <ScrollArea className="flex-1 px-5">
          <div className="py-5">
            <div className="flex flex-col gap-1 cursor-pointer">
              {noteTitles.map((title, index) => (
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
              ))}
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
      <div className="mainsection w-full flex flex-col relative">
        <div className="header flex justify-between items-center w-full p-5">
          <div className="flex gap-5">
            <Button
              variant={'secondary'}
              className="h-10 w-10"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <PanelLeft className="h-5 w-5 flex-shrink-0" />
            </Button>
            <Logo />
          </div>
          <ModeToggle />
        </div>
        <ScrollArea className="page h-full w-full">
          <div className="editorsection h-full p-24 flex flex-col gap-6 ">
            <div className="title w-full h-fit font-bold text-5xl">
              {selectedNote !== null
                ? noteTitles[selectedNote]
                : 'Select a note'}
            </div>
            <div
              className="content h-fit flex flex-col gap-6 text-[1rem]"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            ></div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Dashboard;
