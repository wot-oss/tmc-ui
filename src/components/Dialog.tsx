import { Dialog, DialogPanel } from '@headlessui/react';
import React, { useState } from 'react';
import type { ThingDescription } from 'wot-typescript-definitions';

type ItemStatus = 'idle' | 'copied' | 'error' | 'sent';

interface OpenTarget {
  name: string;
  url: string;
  status: ItemStatus;
  handleOnClick: () => void;
}

interface DialogActionProps {
  open: boolean;
  fullDescription: ThingDescription | null;
  onClose: () => void;
}

interface TdTransferMessage {
  type: 'TMC_UI_TD_TRANSFER';
  payload: ThingDescription;
  sentAt: string;
}

const postMessageWithRetry = (
  popup: Window,
  targetOrigin: string,
  message: TdTransferMessage,
): void => {
  let attempts = 0;
  const maxAttempts = 12;
  const intervalMs = 250;

  const timer = window.setInterval(() => {
    if (popup.closed) {
      window.clearInterval(timer);
      return;
    }

    popup.postMessage(message, targetOrigin);
    attempts += 1;
    console.log('[postMessage sent]', { targetOrigin, message });
    if (attempts >= maxAttempts) {
      window.clearInterval(timer);
    }
  }, intervalMs);
};

const DialogAction: React.FC<DialogActionProps> = ({ open, fullDescription, onClose }) => {
  const [targets, setTargets] = useState<OpenTarget[]>([
    {
      name: 'Editdor',
      url: 'https://eclipse-editdor.github.io/editdor/',
      status: 'idle',
      handleOnClick: () => handleSendDataCrossOrigin(0),
    },
    {
      name: 'TD Playground',
      url: 'https://playground.thingweb.io/',
      status: 'idle',
      handleOnClick: () => handleOpen(1),
    },
  ]);

  const handleSendDataCrossOrigin = (idx: number): void => {
    if (!fullDescription) {
      return;
    }

    const target = targets[idx];

    try {
      const targetOrigin = new URL(target.url).origin;
      const popup = window.open(target.url, '_blank');

      if (!popup) {
        setTargets((prev) => prev.map((t, i) => (i === idx ? { ...t, status: 'error' } : t)));
        return;
      }

      const message: TdTransferMessage = {
        type: 'TMC_UI_TD_TRANSFER',
        payload: fullDescription,
        sentAt: new Date().toISOString(),
      };

      postMessageWithRetry(popup, targetOrigin, message);

      setTargets((prev) => prev.map((t, i) => (i === idx ? { ...t, status: 'sent' } : t)));
    } catch {
      setTargets((prev) => prev.map((t, i) => (i === idx ? { ...t, status: 'error' } : t)));
    }
  };

  const handleOpen = async (idx: number) => {
    if (!fullDescription) return;
    try {
      const json = JSON.stringify(fullDescription, null, 2);
      await navigator.clipboard.writeText(json);
      setTargets((prev) => prev.map((t, i) => (i === idx ? { ...t, status: 'copied' } : t)));
      const win = window.open(targets[idx].url, '_blank');
      if (!win) window.location.href = targets[idx].url;
    } catch {
      setTargets((prev) => prev.map((t, i) => (i === idx ? { ...t, status: 'error' } : t)));
    }
  };

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
