import { useCallback, useRef, useState } from 'react';
import { Menu } from '@headlessui/react';
import {
  IconDots,
  IconDownload,
  IconUpload,
  IconCloudDownload,
  IconX,
  IconTrash,
  IconCornerDownRight,
  IconCloudUpload,
} from '@tabler/icons';
import { usePopper } from 'react-popper';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import classNames from 'classnames';
import Portal from 'components/Portal';
import { useCurrentNote } from 'utils/useCurrentNote';
import { store, useStore } from 'lib/store';
import serialize from 'editor/serialization/serialize';
import { Note } from 'types/supabase';
import useImport from 'utils/useImport';
import Tooltip from 'components/Tooltip';
import OpenSidebarButton from 'components/sidebar/OpenSidebarButton';
import { DropdownItem } from 'components/Dropdown';
import useDeleteNote from 'utils/useDeleteNote';
import NoteMetadata from 'components/NoteMetadata';
import MoveToModal from 'components/MoveToModal';
import useOnClosePane from 'utils/useOnClosePane';

export default function NoteHeader() {
  const currentNote = useCurrentNote();
  const onImport = useImport();

  const isSidebarButtonVisible = useStore(
    (state) => !state.isSidebarOpen && state.openNoteIds?.[0] === currentNote.id
  );
  const isCloseButtonVisible = useStore(
    (state) => state.openNoteIds.length > 1
  );
  const note = useStore((state) => state.notes[currentNote.id]);

  const onClosePane = useOnClosePane();

  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const { styles, attributes } = usePopper(
    menuButtonRef.current,
    popperElement,
    { placement: 'bottom-start' }
  );

  const onExportClick = useCallback(async () => {
    saveAs(getNoteAsBlob(note), `${note.title}.md`);
  }, [note]);

  const onExportAllClick = useCallback(async () => {
    const zip = new JSZip();

    const notes = Object.values(store.getState().notes);
    for (const note of notes) {
      zip.file(`${note.title}.md`, getNoteAsBlob(note));
    }

    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, 'notabase-export.zip');
  }, []);

  const onDeleteClick = useDeleteNote(currentNote.id);

  const [isMoveToModalOpen, setIsMoveToModalOpen] = useState(false);
  const onMoveToClick = useCallback(() => setIsMoveToModalOpen(true), []);

  const setIsPublishModalOpen = useStore(
    (state) => state.setIsPublishModalOpen
  );

  const buttonClassName =
    'rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-600';
  const iconClassName = 'text-gray-600 dark:text-gray-300';

  return (
    <div className="flex w-full items-center justify-between px-4 py-1 text-right">
      <div>{isSidebarButtonVisible ? <OpenSidebarButton /> : null}</div>
      <div className="flex items-center">
        <button
          className={classNames(buttonClassName, 'flex items-center py-1 px-2')}
          onClick={() => setIsPublishModalOpen(true)}
        >
          <IconCloudUpload size={20} className={iconClassName} />
          <span className="ml-1">Publish</span>
        </button>
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button
                ref={menuButtonRef}
                className={buttonClassName}
                title="Options (export, import, etc.)"
                data-testid="note-menu-button"
              >
                <Tooltip content="Options (export, import, etc.)">
                  <span className="flex h-8 w-8 items-center justify-center">
                    <IconDots className={iconClassName} />
                  </span>
                </Tooltip>
              </Menu.Button>
              {open && (
                <Portal>
                  <Menu.Items
                    ref={setPopperElement}
                    data-testid="note-menu-button-dropdown"
                    className="z-10 w-56 overflow-hidden rounded bg-white shadow-popover focus:outline-none dark:bg-gray-800"
                    static
                    style={styles.popper}
                    {...attributes.popper}
                  >
                    <DropdownItem onClick={onImport}>
                      <IconDownload size={18} className="mr-1" />
                      <span>Import</span>
                    </DropdownItem>
                    <DropdownItem onClick={onExportClick}>
                      <IconUpload size={18} className="mr-1" />
                      <span>Export</span>
                    </DropdownItem>
                    <DropdownItem onClick={onExportAllClick}>
                      <IconCloudDownload size={18} className="mr-1" />
                      <span>Export All</span>
                    </DropdownItem>
                    <DropdownItem
                      onClick={onDeleteClick}
                      className="border-t dark:border-gray-700"
                    >
                      <IconTrash size={18} className="mr-1" />
                      <span>Delete</span>
                    </DropdownItem>
                    <DropdownItem onClick={onMoveToClick}>
                      <IconCornerDownRight size={18} className="mr-1" />
                      <span>Move to</span>
                    </DropdownItem>
                    <NoteMetadata note={note} />
                  </Menu.Items>
                </Portal>
              )}
            </>
          )}
        </Menu>
        {isCloseButtonVisible ? (
          <Tooltip content="Close pane">
            <button
              className={buttonClassName}
              onClick={onClosePane}
              title="Close pane"
            >
              <span className="flex h-8 w-8 items-center justify-center">
                <IconX className={iconClassName} />
              </span>
            </button>
          </Tooltip>
        ) : null}
      </div>
      {isMoveToModalOpen ? (
        <Portal>
          <MoveToModal
            noteId={currentNote.id}
            setIsOpen={setIsMoveToModalOpen}
          />
        </Portal>
      ) : null}
    </div>
  );
}

const getSerializedNote = (note: Note) =>
  note.content.map((n) => serialize(n)).join('');

const getNoteAsBlob = (note: Note) => {
  const serializedContent = getSerializedNote(note);
  const blob = new Blob([serializedContent], {
    type: 'text/markdown;charset=utf-8',
  });
  return blob;
};
