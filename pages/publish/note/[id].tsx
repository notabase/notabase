import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Path } from 'slate';
import { useStore } from 'lib/store';
import { queryParamToArray } from 'utils/url';
import usePrevious from 'utils/usePrevious';
import supabase from 'lib/supabase';
import { Note as NoteType } from 'types/supabase';
import { PickPartial } from 'types/utils';
import PublishNote from 'components/publish/PublishNote';
import PageLoading from 'components/PageLoading';
import getHighlightedPath from 'utils/getHighlightedPath';

export type PublishNote = PickPartial<
  NoteType,
  'user_id' | 'created_at' | 'updated_at'
>;

export default function NotePage() {
  const router = useRouter();
  const {
    query: { id: noteId, stack: stackQuery },
  } = router;

  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [note, setNote] = useState<PublishNote | null>(null);
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const prevOpenNoteIds = usePrevious(openNoteIds);

  const pageTitle = useStore((state) => {
    if (!noteId || typeof noteId !== 'string' || !state.notes[noteId]?.title) {
      return 'Notabase';
    }
    return state.notes[noteId].title;
  });

  const [highlightedPath, setHighlightedPath] = useState<{
    index: number;
    path: Path;
  } | null>(null);

  const initData = useCallback(async () => {
    if (!noteId || typeof noteId !== 'string') {
      return;
    }

    const { data: note, status } = await supabase
      .from('notes')
      .select('id, title, content')
      .eq('id', noteId)
      .single();

    if (status === 200) {
      setNote(note);
    }

    setIsPageLoaded(true);
  }, [noteId]);

  useEffect(() => {
    initData();
  }, [initData]);

  // Initialize open notes and highlighted path
  useEffect(() => {
    if (!noteId || typeof noteId !== 'string') {
      return;
    }

    // Initialize open note ids
    const newOpenNoteIds = [noteId, ...queryParamToArray(stackQuery)];
    setOpenNoteIds(newOpenNoteIds);

    // We use router.asPath specifically so we handle any route change (even if asPath is the same)
    const newHighlightedPath = getHighlightedPath(router.asPath);
    setHighlightedPath(newHighlightedPath);
  }, [setOpenNoteIds, router, noteId, stackQuery]);

  useEffect(() => {
    // Scroll the last open note into view if:
    // 1. The last open note id has changed
    // 2. prevOpenNoteIds has length > 0 (ensures that this is not the first render)
    // 3. highlightedPath is not set (if it is, scrolling will be handled by the editor component)
    if (
      openNoteIds.length > 0 &&
      prevOpenNoteIds &&
      prevOpenNoteIds.length > 0 &&
      openNoteIds[openNoteIds.length - 1] !==
        prevOpenNoteIds[prevOpenNoteIds.length - 1] &&
      !highlightedPath
    ) {
      document
        .getElementById(openNoteIds[openNoteIds.length - 1])
        ?.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
        });
    }
  }, [openNoteIds, prevOpenNoteIds, highlightedPath]);

  if (!isPageLoaded) {
    return <PageLoading />;
  }

  if (!noteId || typeof noteId !== 'string' || !note) {
    return (
      <>
        <Head>
          <title>Not Found | Notabase</title>
        </Head>
        <div className="flex h-screen flex-1 flex-col items-center justify-center p-4">
          <p className="text-center text-2xl">
            Whoops! This note doesn&apos;t exist or you don&apos;t have
            permission to view it.
          </p>
          <Link href="/app" className="btn mt-6">
            Go back to my notes
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className="flex flex-1 divide-x divide-gray-200 overflow-x-auto dark:divide-gray-700">
        {openNoteIds.length > 0
          ? openNoteIds.map((noteId, index) => (
              <PublishNote
                key={noteId}
                note={note}
                className="sticky left-0"
                highlightedPath={
                  highlightedPath?.index === index
                    ? highlightedPath.path
                    : undefined
                }
              />
            ))
          : null}
      </div>
    </>
  );
}
