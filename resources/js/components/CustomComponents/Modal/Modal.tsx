import { X } from "lucide-react";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

interface ModalHeaderProps {
  title?: string;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = memo(({ title, onClose }) => {
  return (
    <div className="modal-header">
      <h6>{title}</h6>
      <button onClick={onClose} className="link link-red">
        <X className="size-5" />
      </button>
    </div>
  );
});

ModalHeader.displayName = 'ModalHeader';

const ModalContent: React.FC<{ children?: React.ReactNode; contentClass?: string }> = memo(({
  children,
  contentClass,
}) => {
  return <div className={`modal-content ${contentClass}`}>{children}</div>;
});

ModalContent.displayName = 'ModalContent';

interface ModalFooterProps {
  children?: React.ReactNode;
  footerClass?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = memo(({ children, footerClass }) => {
  return <div className={`modal-footer ${footerClass}`}>{children}</div>;
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
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      document.body.classList.add("overflow-hidden");

      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const positionClass = `modal-${position}`;

  if (!isVisible) return null;

  return (
    <>
      <div>
        <div className={`backdrop-overlay ${isAnimating ? "show" : ""}`} onClick={closeWithAnimation} />
        <div
          className={`modal  ${positionClass} ${isAnimating ? "show" : ""}`}
          onClick={handleOverlayClick}
          id={id}
        >
          <div className={`modal-wrap modal-${size} modal-${position}`} ref={modalRef}>
            {title ? <ModalHeader title={title} onClose={closeWithAnimation} /> : null}
            <ModalContent contentClass={contentClass}>{content}</ModalContent>
            {footer ? <ModalFooter footerClass={footerClass}>{footer}</ModalFooter> : null}
          </div>
        </div>
      </div>
    </>
  );
};

export { Modal, ModalContent, ModalFooter, ModalHeader };
