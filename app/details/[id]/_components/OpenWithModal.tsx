import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import React, { useEffect, useRef, useState } from 'react';
import type { ThingDescription } from 'wot-typescript-definitions';
import Button from '../../../_components/base/Button';

type ItemStatus = 'idle' | 'opening' | 'error' | 'sent';

interface OpenWithModalProps {
  open: boolean;
  TM: ThingDescription | null;
  onClose: () => void;
}

const EDITDOR_URL = process.env.EDITDOR_URL || 'https://eclipse-editdor.github.io/editdor/';
const PLAYGROUND_URL = process.env.PLAYGROUND_URL || 'https://playground.thingweb.io/';
const TIMEOUT_MS = 10000;
const INITIAL_STATUSES = {
  editdor: 'idle' as ItemStatus,
  playground: 'idle' as ItemStatus,
};

interface PendingEditdorMessage {
  description: string;
  payload: string;
}

const OpenWithModal: React.FC<OpenWithModalProps> = ({ open, TM, onClose }) => {
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
    setStatuses((prev) => ({ ...prev, [statusKey]: 'opening' }));
    pendingEditdorMessageRef.current = {
      description: TM?.title || TM?.id || 'No title or id available in the Thing Description',
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
      image: '/icons/editdor.png',
      status: statuses.editdor,
      handleOnClick: () => {
        if (!TM) return;
        handleOnOpenExternalApplication(EDITDOR_URL, JSON.stringify(TM, null, 2), 'editdor');
      },
    },
    {
      name: 'TD Playground',
      url: PLAYGROUND_URL,
      image: '/icons/playground.png',
      status: statuses.playground,
      handleOnClick: () => {
        if (!TM) return;
        handleOnOpenExternalApplication(PLAYGROUND_URL, JSON.stringify(TM, null, 2), 'playground');
      },
    },
  ];

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[60]">
      <div className="bg-overlay-backdrop fixed inset-0" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-surface-modal border-border-subtle max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-auto rounded-lg border shadow-xl">
          <div className="border-border-subtle flex items-start gap-4 border-b px-5 py-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-text-primary text-lg font-semibold">
                Open with
              </DialogTitle>
            </div>
            <Button
              variant="none"
              size="sm"
              onClick={onClose}
              aria-label="Close open with"
              title="Close"
              className="text-text-secondary hover:text-text-primary shrink-0"
            >
              <XMarkIcon aria-hidden="true" className="size-5" />
            </Button>
          </div>
          <ul className="divide-border-subtle divide-y px-5">
            {targets.map((target) => (
              <li key={target.name} className="py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-surface-input flex size-10 shrink-0 items-center justify-center rounded-md">
                    <img
                      src={target.image}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-text-primary text-sm font-semibold">{target.name}</h3>
                    <p className="text-text-tertiary mt-1 text-xs break-all">{target.url}</p>
                  </div>
                  <Button
                    type="button"
                    onClick={target.handleOnClick}
                    disabled={!TM || targets.some((item) => item.status === 'opening')}
                    aria-label={`Open ${target.name} in a new tab`}
                    title={`Open ${target.name} in a new tab`}
                    className="shrink-0 justify-center gap-2 border"
                    variant="default"
                    size="sm"
                  >
                    {target.status === 'opening' ? (
                      <ArrowPathIcon
                        aria-hidden="true"
                        className="size-4 animate-spin motion-reduce:animate-none"
                      />
                    ) : (
                      <ArrowTopRightOnSquareIcon aria-hidden="true" className="size-4" />
                    )}
                    Open
                  </Button>
                </div>
                <p
                  role="status"
                  className={
                    target.status === 'opening' || target.status === 'error'
                      ? `mt-2 flex items-center gap-1.5 pl-[3.25rem] text-xs ${
                          target.status === 'error'
                            ? 'text-status-error-strong'
                            : 'text-text-secondary'
                        }`
                      : 'sr-only'
                  }
                >
                  {target.status === 'opening' && 'Opening application...'}
                  {target.status === 'error' && (
                    <>
                      <ExclamationCircleIcon aria-hidden="true" className="size-4 shrink-0" />
                      Could not send the model. Try again.
                    </>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default OpenWithModal;
