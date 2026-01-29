import React, { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast, useToasts, ToastContainer } from './Toast';

interface PageProps {
  flash?: {
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
  };
}

/**
 * Flash Messages Component
 *
 * This component automatically displays flash messages from the Laravel backend
 * as toast notifications. Add this component to your main layout.
 *
 * Usage:
 * 1. In your Laravel controller: return back()->with('success', 'Item saved!');
 * 2. The message will appear as a toast notification
 */
export const FlashMessages: React.FC = () => {
  const { flash } = usePage<PageProps>().props;
  const { toasts, dismiss } = useToasts();

  useEffect(() => {
    if (flash?.success) {
      toast.success('Success', flash.success);
    }
    if (flash?.error) {
      toast.error('Error', flash.error);
    }
    if (flash?.info) {
      toast.info('Info', flash.info);
    }
    if (flash?.warning) {
      toast.warning('Warning', flash.warning);
    }
  }, [flash]);

  return <ToastContainer toasts={toasts} onDismiss={dismiss} />;
};

export default FlashMessages;
