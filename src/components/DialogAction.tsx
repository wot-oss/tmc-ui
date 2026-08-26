import { Dialog, DialogPanel } from '@headlessui/react';
import React, { useEffect, useRef, useState } from 'react';
import type { ThingDescription } from 'wot-typescript-definitions';
import Button from './base/Button';

type ItemStatus = 'idle' | 'copied' | 'error' | 'sent';

interface DialogActionProps {
  open: boolean;
  fullDescription: ThingDescription | null;
  onClose: () => void;
}

const EDITDOR_URL =
  import.meta.env.VITE_EDITDOR_URL || 'https://eclipse-editdor.github.io/editdor/';
const PLAYGROUND_URL = import.meta.env.VITE_PLAYGROUND_URL || 'https://playground.thingweb.io/';
const TIMEOUT_MS = 10000;
const INITIAL_STATUSES = {
  editdor: 'idle' as ItemStatus,
  playground: 'idle' as ItemStatus,
};

interface PendingEditdorMessage {
  description: string;
  payload: string;
}

const DialogAction: React.FC<DialogActionProps> = ({ open, fullDescription, onClose }) => {
  const [statuses, setStatuses] = useState(INITIAL_STATUSES);
  const editdorWindowRef = useRef<Window | null>(null);
  const pendingEditdorMessageRef = useRef<PendingEditdorMessage | null>(null);
  const editdorReadyTimeoutRef = useRef<number | null>(null);
  const pendingOriginRef = useRef<string | null>(null);
  const pendingStatusKeyRef = useRef<keyof typeof INITIAL_STATUSES | null>(null);

  useEffect(() => {
    setStatuses(INITIAL_STATUSES);

    if (!open) {
      if (editdorReadyTimeoutRef.current !== null) {
        window.clearTimeout(editdorReadyTimeoutRef.current);
        editdorReadyTimeoutRef.current = null;
      }

      pendingEditdorMessageRef.current = null;
      editdorWindowRef.current = null;
    }
  }, [open]);

  useEffect(() => {
    function handleEditdorMessage(event: MessageEvent) {
      if (!pendingOriginRef.current || event.origin !== pendingOriginRef.current) {
        return;
      }

      if (event.source !== editdorWindowRef.current) {
        return;
      }

      if (event.data?.type !== 'APPLICATION_READY') {
        return;
      }

      if (!editdorWindowRef.current || !pendingEditdorMessageRef.current) {
        return;
      }

      editdorWindowRef.current.postMessage(
        {
          type: 'LOAD_TD',
          description: pendingEditdorMessageRef.current.description,
          payload: pendingEditdorMessageRef.current.payload,
        },
        pendingOriginRef.current,
      );

      if (editdorReadyTimeoutRef.current !== null) {
        window.clearTimeout(editdorReadyTimeoutRef.current);
        editdorReadyTimeoutRef.current = null;
      }

      pendingEditdorMessageRef.current = null;
      const statusKey = pendingStatusKeyRef.current;
      if (statusKey) setStatuses((prev) => ({ ...prev, [statusKey]: 'sent' }));
    }

    window.addEventListener('message', handleEditdorMessage);

    return () => {
      if (editdorReadyTimeoutRef.current !== null) {
        window.clearTimeout(editdorReadyTimeoutRef.current);
        editdorReadyTimeoutRef.current = null;
      }

      pendingEditdorMessageRef.current = null;
      editdorWindowRef.current = null;
      window.removeEventListener('message', handleEditdorMessage);
    };
  }, []);

  function handleOnOpenExternalApplication(
    url: string,
    tdJson: string,
    statusKey: keyof typeof INITIAL_STATUSES,
  ): void {
    pendingOriginRef.current = new URL(url).origin;
    pendingStatusKeyRef.current = statusKey;
    setStatuses((prev) => ({ ...prev, [statusKey]: 'idle' }));
    pendingEditdorMessageRef.current = {
      description:
        fullDescription?.title ||
        fullDescription?.id ||
        'No title or id available in the Thing Description',
      payload: tdJson,
    };

    const editdorWindow = window.open(url, '_blank');

    if (!editdorWindow) {
      pendingEditdorMessageRef.current = null;
      setStatuses((prev) => ({ ...prev, [statusKey]: 'error' }));
      return;
    }

    editdorWindowRef.current = editdorWindow;

    if (editdorReadyTimeoutRef.current !== null) {
      window.clearTimeout(editdorReadyTimeoutRef.current);
    }

    editdorReadyTimeoutRef.current = window.setTimeout(() => {
      pendingEditdorMessageRef.current = null;
      editdorWindowRef.current = null;
      editdorReadyTimeoutRef.current = null;
      setStatuses((prev) => ({
        ...prev,
        [statusKey]: prev[statusKey] === 'sent' ? prev[statusKey] : 'error',
      }));
    }, TIMEOUT_MS);
  }

  const targets = [
    {
      name: 'EdiTDor',
      url: EDITDOR_URL,
      status: statuses.editdor,
      handleOnClick: () => {
        if (!fullDescription) return;
        handleOnOpenExternalApplication(
          EDITDOR_URL,
          JSON.stringify(fullDescription, null, 2),
          'editdor',
        );
      },
    },
    {
      name: 'TD Playground',
      url: PLAYGROUND_URL,
      status: statuses.playground,
      handleOnClick: () => {
        if (!fullDescription) return;
        handleOnOpenExternalApplication(
          PLAYGROUND_URL,
          JSON.stringify(fullDescription, null, 2),
          'playground',
        );
      },
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-overlay-backdrop" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md rounded-lg bg-surface-modal p-6 shadow-lg">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Open with …</h2>
          <ul className="flex flex-col gap-3">
            {targets.map((t) => (
              <li key={t.name} className="flex items-center gap-3">
                <div className="flex-1">
                  <Button
                    type="button"
                    onClick={t.handleOnClick}
                    disabled={!fullDescription}
                    text={t.name}
                    className="w-40 justify-center border p-4"
                    variant="default"
                  />
                </div>
                <span className="px-3 text-sm text-status-success">
                  {t.status === 'copied' && 'Copied!'}
                  {t.status === 'error' && 'Copy failed'}
                  {t.status === 'sent' && `TD sent to ${t.name}!`}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              className="border p-4"
              onClick={() => {
                if (editdorReadyTimeoutRef.current !== null) {
                  window.clearTimeout(editdorReadyTimeoutRef.current);
                  editdorReadyTimeoutRef.current = null;
                }

                pendingEditdorMessageRef.current = null;
                editdorWindowRef.current = null;
                setStatuses(INITIAL_STATUSES);
                onClose();
              }}
              text="Close"
              variant="default"
            />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default DialogAction;
