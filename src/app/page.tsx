/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Navbar from '@/components/navbar';
import Image from 'next/image';
import { auth } from '@/auth';
import { LetterText, ListTree, NotepadText } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Logo from '@/components/ui/logo';
export default async function Home() {
  const session = await auth();
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="w-full flex flex-col justify-center m-0 p-0">
      <Navbar />
      <div className="container max-w-[1200px] h-fit flex flex-col items-center pt-40 py-10 md:py-20 md:pt-44">
        <div className="mb-5">
          <div className="hero mb-3 md:mb-5 leading-normal lg:leading-[80px] text-[7vw] md:text-7xl font-black dark:font-extrabold w-full text-center tracking-normal">
            <div className="mb-2 md:mb-5">
              All You Need to Write,
              <br /> Organized in One Place.
            </div>
            <div className="desc text-[4vw] md:text-xl w-full px-[1vw] sm:px-[15%] font-semibold text-zinc-500 dark:text-zinc-400">
              A powerful digital notebook app that helps you create, save, and
              refine ideas with ease. Powered by Gemini, your intelligent
              assistant for seamless writing.
            </div>
          </div>
        </div>
        <div className="rootnav flex gap-5 mb-10 font-semibold text-[4vw] md:text-base items-center">
          <Link
            href="/demopage"
            className="border-2 border-secondary py-1 px-3 md:py-2 md:px-5 rounded-md"
          >
            Try Demo
          </Link>
          <Link
            href="/login"
            className="border-2 border-secondary bg-secondary rounded-md py-1 px-3 md:py-2 md:px-5"
          >
            Sign Up
          </Link>
        </div>
        <Image
          className="mb-20 rounded-md border-2 border-secondary dark:hidden"
          src={'/memoriouslight.png'}
          alt=""
          width={1200}
          height={600}
        />
        <Image
          className="mb-20 md:mb-24 rounded-md border-2 border-secondary hidden dark:block"
          src={'/memoriousdark.png'}
          alt=""
          width={1200}
          height={500}
        />
        <div className="gemini flex flex-col items-center justify-center">
          <div className="title w-full text-center text-[6vw] md:text-4xl font-bold mb-5 md:mb-10">
            Integrated Gemini
          </div>
          <Image
            className="mb-5 md:mb-10 h-[20vw] md:h-full hiver:shadow-lg shadow-inherit"
            src={'/gemini.svg'}
            alt=""
            width={200}
            height={200}
          />
          <div className="desc text-[4vw] md:text-lg font-semibold text text-center sm:px-[20%] mb-24 text-zinc-500">
            Experience effortless note-taking with Integrated Gemini. Simply
            prompt, and let Gemini generate structured, detailed notes in
            seconds.
          </div>
        </div>
        <div className="features w-full flex flex-col md:flex-row gap-14 md:gap-x-24 md:gap-y-20 items-start">
          <div className="feature flex flex-col gap-4">
            <div className="icon text-foreground bg-secondary h-fit w-fit p-4 rounded-lg">
              <NotepadText className="size-[8vw] md:size-12" />
            </div>
            <div>
              <div className="title text-[5vw] md:text-xl font-bold mb-1">
                Easy Note Creation
              </div>
              <div className="desc text-[4vw] md:text-lg font-semibold text-zinc-500">
                Create, organize, and save your ideas with ease. Whether it's a
                quick thought or a detailed project, Memorious makes it simple.
              </div>
            </div>
          </div>
          <div className="feature flex flex-col gap-6">
            <div className="icon text-foreground bg-secondary h-fit w-fit p-4 rounded-lg">
              <LetterText className="size-[8vw] md:size-12" />
            </div>
            <div>
              <div className="title text-[5vw] md:text-xl font-bold mb-1">
                Rich Text Editing
              </div>
              <div className="desc text-[4vw] md:text-lg font-semibold text-zinc-500">
                Format your notes exactly the way you want. With rich text
                editing, you can add headings, lists, and more to make your
                notes stand out.
              </div>
            </div>
          </div>
          <div className="feature flex flex-col gap-6">
            <div className="icon text-foreground bg-secondary h-fit w-fit p-4 rounded-lg">
              <ListTree className="size-[8vw] md:size-12" />
            </div>
            <div>
              <div className="text-[5vw] md:text-lg text-xl font-bold mb-1">
                Simple Organization
              </div>
              <div className="desc text-[4vw] md:text-lg font-semibold text-zinc-500">
                Say goodbye to clutter. Memorious helps you keep your notes
                neatly organized, so you can focus on what truly matters.
              </div>
            </div>
          </div>
        </div>
        <div className="footer mt-10 md:mt-20">
          <div className="flex items-center justify-center gap-3 md:gap-5">
            <Logo />
            <Separator orientation="vertical" className="h-12 w-[2px]" />
            <div className="email text-base font-semibold">
              memorious.so@gmail.com
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
