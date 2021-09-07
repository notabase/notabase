import { CSSProperties, ForwardedRef, forwardRef, memo, useMemo } from 'react';
import Link from 'next/link';
import { IconCaretDown, IconCaretRight } from '@tabler/icons';
import { useStore } from 'lib/store';
import { isMobile } from 'utils/device';
import SidebarItem from './SidebarItem';
import SidebarNoteLinkDropdown from './SidebarNoteLinkDropdown';
import { FlattenedNoteTreeItem } from './SidebarNotesTree';

type Props = {
  node: FlattenedNoteTreeItem;
  onArrowClick: () => void;
  isHighlighted?: boolean;
  style?: CSSProperties;
};

const SidebarNoteLink = (
  props: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>
) => {
  const { node, onArrowClick, isHighlighted, style } = props;

  const note = useStore((state) => state.notes[node.id]);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);

  const leftPadding = useMemo(() => node.depth * 16, [node.depth]);

  const Icon = useMemo(
    () => (node.collapsed ? IconCaretRight : IconCaretDown),
    [node.collapsed]
  );

  return (
    <SidebarItem
      ref={forwardedRef}
      className="relative flex items-center justify-between overflow-x-hidden group"
      isHighlighted={isHighlighted}
      style={style}
    >
      <Link href={`/app/note/${note.id}`}>
        <a
          className={`flex items-center flex-1 px-2 py-1 overflow-hidden overflow-ellipsis whitespace-nowrap ${leftPadding}`}
          onClick={() => {
            if (isMobile()) {
              setIsSidebarOpen(false);
            }
          }}
        >
          <button
            className="p-1 mr-1 rounded hover:bg-gray-300 active:bg-gray-400 dark:hover:bg-gray-700 dark:active:bg-gray-400"
            onClick={(e) => {
              e.preventDefault();
              onArrowClick();
            }}
          >
            <Icon
              className="flex-shrink-0 text-gray-500 dark:text-gray-100"
              size={16}
              fill="currentColor"
            />
          </button>
          <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
            {note.title}
          </span>
        </a>
      </Link>
      <SidebarNoteLinkDropdown
        note={note}
        className="hidden group-hover:block"
      />
    </SidebarItem>
  );
};

export default memo(forwardRef(SidebarNoteLink));
