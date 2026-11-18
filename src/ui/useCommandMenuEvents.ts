import { useEffect, type Dispatch, type RefObject, type SetStateAction } from 'react';

export const COMMAND_MENU_EVENT = 'portfolio:open-command-menu';

export function useCommandMenuEvents(
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>,
  dialogRef: RefObject<HTMLElement>,
  setOrigin: Dispatch<SetStateAction<DOMRect | null>>,
) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.isComposing || event.keyCode === 229) return;
      if (document.querySelector('[role="dialog"], dialog[open]') && !dialogRef.current) return;
      const target = event.target as HTMLElement | null;
      const inField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        !!target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOrigin(null);
        setOpen((value) => !value);
        return;
      }
      if (!inField && event.key === '?') {
        event.preventDefault();
        setOrigin(null);
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogRef, setOpen, setOrigin]);

  useEffect(() => {
    const openFromControl = () => {
      setOrigin(document.activeElement?.getBoundingClientRect() ?? null);
      setOpen(true);
    };
    window.addEventListener(COMMAND_MENU_EVENT, openFromControl);
    return () => window.removeEventListener(COMMAND_MENU_EVENT, openFromControl);
  }, [setOpen, setOrigin]);

  useEffect(() => {
    if (open)
      document
        .querySelectorAll<HTMLElement>('[popover]:popover-open')
        .forEach((element) => element.hidePopover());
  }, [open]);
}
