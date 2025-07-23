"use client";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  details?: string[];
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  // New props for multiple action support
  actions?: Array<{
    label: string;
    onClick: () => void;
    type: 'danger' | 'warning' | 'primary' | 'default';
    isLoading?: boolean;
  }>;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  details = [],
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'danger',
  isLoading = false,
  actions
}: ConfirmationModalProps) {

  // Get styling based on confirmation type
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          headerBg: 'bg-gradient-to-r from-red-500 to-red-600',
          borderColor: 'border-red-200',
          bgColor: 'bg-red-50',
          confirmButtonColor: 'danger' as const
        };
      case 'warning':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          headerBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
          borderColor: 'border-yellow-200',
          bgColor: 'bg-yellow-50',
          confirmButtonColor: 'warning' as const
        };
      case 'info':
      default:
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          headerBg: 'bg-gradient-to-r from-[#143D60] to-[#1e4a6b]',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50',
          confirmButtonColor: 'primary' as const
        };
    }
  };

  const config = getTypeConfig();

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onClose}
      size="lg"
      isDismissable={!isLoading}
      hideCloseButton={isLoading}
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "border-0 shadow-2xl",
        header: "border-b-0 pb-0",
        body: "pt-0",
        footer: "border-t-0 pt-0"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {/* Header with gradient background */}
            <ModalHeader className={`${config.headerBg} text-white rounded-t-lg`}>
              <div className="flex items-center gap-3 w-full">
                <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center`}>
                  <div className={config.iconColor}>
                    {config.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-white/80 text-sm">
                    Please confirm your action
                  </p>
                </div>
                {!isLoading && (
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </ModalHeader>

            {/* Body with message and details */}
            <ModalBody className="py-6">
              <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4`}>
                <p className="text-gray-800 text-base leading-relaxed mb-4">
                  {message}
                </p>

                {/* Details section if provided */}
                {details.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-700 text-sm">Important Notes:</h4>
                    <ul className="space-y-2">
                      {details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warning for destructive actions */}
                {type === 'danger' && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                      </svg>
                      <span className="text-sm font-medium">⚠️ This action cannot be undone!</span>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>

            {/* Footer with action buttons */}
            <ModalFooter className="pb-6">
              <div className="flex gap-3 w-full justify-end">
                <Button
                  color="default"
                  variant="light"
                  onPress={onClose}
                  disabled={isLoading || (actions && actions.some(a => a.isLoading))}
                  className="font-semibold"
                >
                  {cancelText}
                </Button>

                {/* Multiple actions support */}
                {actions ? (
                  actions.map((action, index) => (
                    <Button
                      key={index}
                      color={action.type}
                      onPress={action.onClick}
                      disabled={isLoading || actions.some(a => a.isLoading)}
                      className="font-semibold"
                      startContent={
                        action.isLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : undefined
                      }
                    >
                      {action.isLoading ? "Processing..." : action.label}
                    </Button>
                  ))
                ) : (
                  /* Single action support (backward compatibility) */
                  <Button
                    color={config.confirmButtonColor}
                    onPress={onConfirm}
                    disabled={isLoading}
                    className="font-semibold"
                    startContent={
                      isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : undefined
                    }
                  >
                    {isLoading ? "Processing..." : confirmText}
                  </Button>
                )}
              </div>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
