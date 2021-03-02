import React, { useEffect, useMemo, useRef } from 'react';
import { useSlate, ReactEditor } from 'slate-react';
import { Editor, Range } from 'slate';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  CodeIcon,
  Header1Icon,
  Header2Icon,
  RightDoubleQuoteIcon,
  BulletedListIcon,
  NumberedListIcon,
} from '@fluentui/react-icons';
import Portal from 'components/Portal';
import {
  toggleMark,
  isMarkActive,
  toggleBlock,
  isBlockActive,
} from 'helper/editor';

export default function HoveringToolbar() {
  const ref = useRef<HTMLDivElement | null>(null);
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection) {
      return;
    }
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    el.style.opacity = '1';
    el.style.visibility = 'visible';
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${rect.left + window.pageXOffset}px`;
  });

  return (
    <Portal selector="#hovering-toolbar">
      <div
        ref={ref}
        className="absolute z-10 flex items-center invisible -mt-2 overflow-hidden transition-opacity bg-white border rounded-md opacity-0 toolbar"
      >
        <FormatButton format="bold" />
        <FormatButton format="italic" />
        <FormatButton format="underline" />
        <FormatButton format="code" />
        <BlockButton format="heading-one" />
        <BlockButton format="heading-two" />
        <BlockButton format="bulleted-list" />
        <BlockButton format="numbered-list" />
        <BlockButton format="block-quote" />
        <style jsx>{`
          .toolbar {
            box-shadow: rgb(15 15 15 / 10%) 0px 3px 6px,
              rgb(15 15 15 / 20%) 0px 9px 24px;
          }
        `}</style>
      </div>
    </Portal>
  );
}

type ToolbarButtonProps = {
  format:
    | 'bold'
    | 'italic'
    | 'underline'
    | 'code'
    | 'heading-one'
    | 'heading-two'
    | 'block-quote'
    | 'bulleted-list'
    | 'numbered-list';
  onClick: () => void;
  isActive?: boolean;
};

const ToolbarButton = (props: ToolbarButtonProps) => {
  const { format, onClick, isActive = false } = props;

  const Icon = useMemo(() => {
    if (format === 'bold') {
      return BoldIcon;
    } else if (format === 'italic') {
      return ItalicIcon;
    } else if (format === 'underline') {
      return UnderlineIcon;
    } else if (format === 'code') {
      return CodeIcon;
    } else if (format === 'heading-one') {
      return Header1Icon;
    } else if (format === 'heading-two') {
      return Header2Icon;
    } else if (format === 'bulleted-list') {
      return BulletedListIcon;
    } else if (format === 'numbered-list') {
      return NumberedListIcon;
    } else if (format === 'block-quote') {
      return RightDoubleQuoteIcon;
    } else {
      throw new Error(`Format ${format} is not a valid format`);
    }
  }, [format]);

  return (
    <span
      className="px-2 py-2 cursor-pointer hover:bg-gray-100"
      onMouseDown={(event) => event.preventDefault()}
      onMouseUp={(event) => {
        if (event.button === 0) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <Icon className={`${isActive ? 'text-primary-500' : 'text-gray-700'}`} />
    </span>
  );
};

type FormatButtonProps = {
  format: 'bold' | 'italic' | 'underline' | 'code';
};

const FormatButton = ({ format }: FormatButtonProps) => {
  const editor = useSlate();
  const isActive = isMarkActive(editor, format);

  return (
    <ToolbarButton
      format={format}
      onClick={() => toggleMark(editor, format)}
      isActive={isActive}
    />
  );
};

type BlockButtonProps = {
  format:
    | 'heading-one'
    | 'heading-two'
    | 'bulleted-list'
    | 'numbered-list'
    | 'block-quote';
};

const BlockButton = ({ format }: BlockButtonProps) => {
  const editor = useSlate();
  const isActive = isBlockActive(editor, format);

  return (
    <ToolbarButton
      format={format}
      onClick={() => toggleBlock(editor, format)}
      isActive={isActive}
    />
  );
};
