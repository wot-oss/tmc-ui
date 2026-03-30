import { Dialog, DialogPanel } from '@headlessui/react';
import React, { useEffect, useRef, useState } from 'react';
import type { ThingDescription } from 'wot-typescript-definitions';

type ItemStatus = 'idle' | 'copied' | 'error' | 'sent';

interface DialogActionProps {
  open: boolean;
  fullDescription: ThingDescription | null;
  onClose: () => void;
}

const EDITDOR_URL = 'http://localhost:5174';
const PLAYGROUND_URL = 'https://playground.thingweb.io/';

const DialogAction: React.FC<DialogActionProps> = ({ open, fullDescription, onClose }) => {
  const editdorWindowRef = useRef<Window | null>(null);
  const pendingTdRef = useRef<string | null>(null);
  const [statuses, setStatuses] = useState({
    editdor: 'idle' as ItemStatus,
    playground: 'idle' as ItemStatus,
  });

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== EDITDOR_URL) return;
      if (event.data?.type !== 'EDITDOR_READY') return;
      if (event.source !== editdorWindowRef.current) return;
      if (!pendingTdRef.current || !editdorWindowRef.current) return;

      editdorWindowRef.current.postMessage(
        {
          type: 'EDITDOR_LOAD_TD',
          payload: pendingTdRef.current,
        },
        EDITDOR_URL,
      );

      setStatuses((prev) => ({ ...prev, editdor: 'sent' }));
    }
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  function handleOnOpenInEdiTDor(tdJson: string): void {
    const editdorWindow = window.open(EDITDOR_URL, '_blank');

    if (!editdorWindow) {
      console.error('Failed to open ediTDor window.');
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== EDITDOR_URL) {
        return;
      }

      if (event.source !== editdorWindow) {
        return;
      }

      if (event.data?.type !== 'EDITDOR_READY') {
        return;
      }

      editdorWindow.postMessage(
        {
          type: 'LOAD_TD',
          payload: tdJson,
        },
        EDITDOR_URL,
      );

      window.removeEventListener('message', handleMessage);
    };
    window.addEventListener('message', handleMessage);
  }

  const handleOpenPlayground = async () => {
    if (!fullDescription) return;

    try {
      const json = JSON.stringify(fullDescription, null, 2);
      await navigator.clipboard.writeText(json);
      setStatuses((prev) => ({ ...prev, playground: 'copied' }));

      const win = window.open(PLAYGROUND_URL, '_blank');
      if (!win) window.location.href = PLAYGROUND_URL;
    } catch {
      setStatuses((prev) => ({ ...prev, playground: 'error' }));
    }
  };

  const targets = [
    {
      name: 'Editdor',
      url: EDITDOR_URL,
      status: statuses.editdor,
      handleOnClick: () => {
        if (!fullDescription) return;
        handleOnOpenInEdiTDor(JSON.stringify(fullDescription, null, 2));
      },
    },
    {
      name: 'TD Playground',
      url: PLAYGROUND_URL,
      status: statuses.playground,
      handleOnClick: handleOpenPlayground,
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-bgBodySecondary p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-textValue">Open with …</h2>
          <ul className="flex flex-col gap-3">
            {targets.map((t) => (
              <li key={t.name} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={t.handleOnClick}
                  disabled={!fullDescription}
                  className="flex-1 rounded-md border border-buttonBorder bg-buttonPrimary px-3 py-2 text-center text-sm text-textWhite hover:bg-buttonOnHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-buttonFocus disabled:opacity-40"
                >
                  <span>{t.name}</span>
                </button>
                <span className="px-3 text-sm text-success">
                  {t.status === 'copied' && 'Copied!'}
                  {t.status === 'error' && 'Copy failed'}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-buttonBorder bg-buttonPrimary px-3 py-2 text-sm font-medium text-textWhite hover:bg-buttonOnHover focus-visible:outline focus-visible:outline-2 focus-visible:outline-buttonFocus"
            >
              Close
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default DialogAction;
