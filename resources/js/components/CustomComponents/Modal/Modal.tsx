import { X } from "lucide-react";
import React, { memo, useCallback, useEffect, useId, useRef, useState } from "react";

interface ModalHeaderProps {
  title?: string;
  onClose: () => void;
  titleId?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = memo(({ title, onClose, titleId }) => {
  return (
    <div className="modal-header">
      <h6 id={titleId}>{title}</h6>
      <button
        onClick={onClose}
        className="link link-red"
        aria-label="Close modal"
        type="button"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
    </div>
  );
});

ModalHeader.displayName = 'ModalHeader';

const ModalContent: React.FC<{ children?: React.ReactNode; contentClass?: string }> = memo(({
  children,
  contentClass,
}) => {
  return <div className={`modal-content ${contentClass || ''}`}>{children}</div>;
});

ModalContent.displayName = 'ModalContent';

interface ModalFooterProps {
  children?: React.ReactNode;
  footerClass?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = memo(({ children, footerClass }) => {
  return <div className={`modal-footer ${footerClass || ''}`}>{children}</div>;
});

ModalFooter.displayName = 'ModalFooter';

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: "center" | "top" | "topLeft" | "tr" | "left" | "right" | "tl" | "tr" | "br" | "bl";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  title?: string;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  id?: string;
  contentClass?: string;
  footerClass?: string;
  ariaDescribedBy?: string;
}

const Modal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  position = "center",
  size = "md",
  title,
  content,
  footer,
  id,
  contentClass,
  footerClass,
  ariaDescribedBy,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const titleId = useId();

  // Focus trapping - get all focusable elements
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    return modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeWithAnimation();
    }
  }, []);

  const closeWithAnimation = useCallback(() => {
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
      setIsVisible(false);
      onClose();
      document.body.classList.remove("overflow-hidden");
      // Restore focus to the element that triggered the modal
      previousFocusRef.current?.focus();
    }, 300);
  }, [onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeWithAnimation();
      return;
    }

    // Focus trapping with Tab key
    if (e.key === 'Tab') {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: move focus backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move focus forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [closeWithAnimation, getFocusableElements]);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element to restore later
      previousFocusRef.current = document.activeElement as HTMLElement;

      setIsVisible(true);
      setIsAnimating(true);
      document.body.classList.add("overflow-hidden");

      // Add keyboard event listener
      document.addEventListener('keydown', handleKeyDown);

      const timeout = setTimeout(() => {
        setIsAnimating(false);
        // Focus the first focusable element in the modal
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }, 300);

      return () => {
        clearTimeout(timeout);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown, getFocusableElements]);

  const positionClass = `modal-${position}`;

  if (!isVisible) return null;

  return (
    <>
      <div>
        {/* Backdrop - hidden from screen readers */}
        <div
          className={`backdrop-overlay ${isAnimating ? "show" : ""}`}
          onClick={closeWithAnimation}
          aria-hidden="true"
        />
        {/* Modal container */}
        <div
          className={`modal ${positionClass} ${isAnimating ? "show" : ""}`}
          onClick={handleOverlayClick}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={ariaDescribedBy}
        >
          <div className={`modal-wrap modal-${size} modal-${position}`} ref={modalRef}>
            {title ? <ModalHeader title={title} onClose={closeWithAnimation} titleId={titleId} /> : null}
            <ModalContent contentClass={contentClass}>{content}</ModalContent>
            {footer ? <ModalFooter footerClass={footerClass}>{footer}</ModalFooter> : null}
          </div>
        </div>
      </div>
    </>
  );
};

export { Modal, ModalContent, ModalFooter, ModalHeader };
