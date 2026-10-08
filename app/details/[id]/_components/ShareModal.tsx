import Button from '@/app/_components/base/Button';
import { Dialog, DialogDescription, DialogPanel, DialogTitle } from '@headlessui/react';
import { CheckIcon, ClipboardDocumentIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';

interface ShareModalProps {
  url: string;
  version?: string;
  onClose: () => void;
}

export default function ShareModal({ url, version, onClose }: ShareModalProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  };

  return (
    <Dialog open onClose={onClose} className="relative z-50">
      <div className="bg-overlay-backdrop fixed inset-0" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="bg-surface-modal border-border-subtle max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-auto rounded-lg border shadow-xl">
          <div className="border-border-subtle flex items-center gap-4 border-b px-5 py-4">
            <DialogTitle className="text-text-primary min-w-0 flex-1 text-lg font-semibold">
              Share Thing Model
            </DialogTitle>
            <Button
              variant="none"
              size="sm"
              onClick={onClose}
              aria-label="Close share"
              title="Close share"
              className="text-text-secondary hover:text-text-primary shrink-0"
            >
              <XMarkIcon aria-hidden="true" className="size-5" />
            </Button>
          </div>
          <div className="space-y-3 p-5">
            <DialogDescription className="text-text-secondary text-sm wrap-break-word">
              {version
                ? `This link shares ${version} of this Thing Model`
                : 'This link shares the currently displayed version of this Thing Model.'}
            </DialogDescription>
            <div>
              <input
                id="share-link"
                type="url"
                readOnly
                value={url}
                onFocus={(event) => event.currentTarget.select()}
                className="bg-surface-input border-border-subtle text-text-primary focus-visible:outline-focus-ring block w-full min-w-0 rounded-md border px-3 py-2 text-sm focus-visible:outline-2"
              />
            </div>
            <Button
              variant="default"
              size="sm"
              className="mt-2 gap-2 border"
              onClick={() => void copyLink()}
            >
              {copyStatus === 'copied' ? (
                <CheckIcon aria-hidden="true" className="size-4" />
              ) : (
                <ClipboardDocumentIcon aria-hidden="true" className="size-4" />
              )}
              {copyStatus === 'copied' ? 'Copied' : 'Copy link'}
            </Button>
            <p
              role="status"
              className={copyStatus === 'error' ? 'text-status-error-strong text-xs' : 'sr-only'}
            >
              {copyStatus === 'copied' && 'Link copied to clipboard'}
              {copyStatus === 'error' && 'Could not copy. Select the link to copy it manually.'}
            </p>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
