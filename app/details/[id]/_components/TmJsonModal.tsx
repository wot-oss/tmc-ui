import Button from '@/app/_components/base/Button';
import { type DetailedInventoryItem } from '@/app/_components/inventory/types';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';
import { useMemo, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import OpenWithModal from './OpenWithModal';

interface TmViewerProps {
  TM: DetailedInventoryItem;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function TmJsonModal({ isOpen, setIsOpen, TM }: TmViewerProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [isOpenWithOpen, setOpenWithOpen] = useState(false);
  const modelJson = JSON.stringify(TM, null, 2);

  const highlightedJson = useMemo(
    () => (isOpen ? Prism.highlight(modelJson, Prism.languages.json, 'json') : ''),
    [isOpen, modelJson],
  );

  const copyModel = async () => {
    try {
      await navigator.clipboard.writeText(modelJson);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  };
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setOpenWithOpen(false);
        setIsOpen(false);
      }}
      className="relative z-50"
    >
      <div className="bg-overlay-backdrop fixed inset-0" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6">
        <DialogPanel className="bg-surface-modal border-border-subtle flex h-[92dvh] max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-lg border shadow-xl sm:max-h-[calc(100dvh-3rem)]">
          <div className="border-border-subtle flex shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2 sm:px-4">
            <DialogTitle className="text-text-primary mr-auto min-w-0 text-sm font-semibold max-sm:w-full">
              Full Thing Model
            </DialogTitle>
            <Button
              variant="default"
              size="sm"
              className="shrink-0 gap-2 border"
              onClick={() => setOpenWithOpen(true)}
            >
              <ArrowTopRightOnSquareIcon aria-hidden="true" className="size-4" />
              Open with
            </Button>
            <Button
              variant="default"
              size="sm"
              className="shrink-0 gap-2 border"
              onClick={() => void copyModel()}
            >
              {copyStatus === 'copied' ? (
                <CheckIcon aria-hidden="true" className="size-4" />
              ) : (
                <ClipboardDocumentIcon aria-hidden="true" className="size-4" />
              )}
              Copy JSON
            </Button>
            <Button
              variant="none"
              size="sm"
              onClick={() => {
                setOpenWithOpen(false);
                setIsOpen(false);
              }}
              aria-label="Close full details"
              title="Close full details"
              className="text-text-secondary hover:text-text-primary shrink-0"
            >
              <XMarkIcon aria-hidden="true" className="size-5" />
            </Button>
          </div>
          <p
            role="status"
            className={
              copyStatus === 'error'
                ? 'text-status-error-strong shrink-0 px-4 py-1 text-xs'
                : 'sr-only'
            }
          >
            {copyStatus === 'copied' && 'Copied to clipboard'}
            {copyStatus === 'error' && 'Could not copy. Select the JSON to copy it manually.'}
          </p>
          <pre
            aria-label="Thing Model JSON"
            tabIndex={0}
            className="tm-json bg-surface-canvas text-text-primary focus-visible:outline-focus-ring min-h-0 flex-1 overflow-auto p-3 text-xs leading-5 focus-visible:outline-2 sm:p-4 sm:text-sm"
          >
            <code dangerouslySetInnerHTML={{ __html: highlightedJson }} />
          </pre>
        </DialogPanel>
      </div>
      <OpenWithModal
        open={isOpen && isOpenWithOpen}
        onClose={() => setOpenWithOpen(false)}
        TM={TM}
      />
    </Dialog>
  );
}
