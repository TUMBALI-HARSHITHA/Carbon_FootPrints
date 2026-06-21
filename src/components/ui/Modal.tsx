import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scrolling
      document.body.style.overflow = 'hidden';
      
      // Accessibility: Focus on the close button or modal container
      modalRef.current?.focus();
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="presentation"
    >
      <div 
        className="modal-container animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <header className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose} 
            aria-label="Close modal"
            className="modal-close-btn"
          >
            <X size={16} />
          </Button>
        </header>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
