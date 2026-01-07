import { Dialog, DialogPanel } from '@headlessui/react';
import React, { useState } from 'react';
import type { ThingDescription } from 'wot-typescript-definitions';

type ItemStatus = 'idle' | 'copied' | 'error';

interface OpenTarget {
  name: string;
  url: string;
  status: ItemStatus;
}

interface DialogActionProps {
  open: boolean;
  fullDescription: ThingDescription | null;
  onClose: () => void;
}

const DialogAction: React.FC<DialogActionProps> = ({ open, fullDescription, onClose }) => {
  const [targets, setTargets] = useState<OpenTarget[]>([
    { name: 'Editdor', url: 'https://eclipse.github.io/editdor/', status: 'idle' },
    { name: 'TD Playground', url: 'https://playground.thingweb.io/', status: 'idle' },
  ]);

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
            {targets.map((t, i) => (
              <li key={t.name} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleOpen(i)}
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
