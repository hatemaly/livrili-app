import { toast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const useToast = () => {
  return {
    toast: {
      success: ({ title, description, action }: ToastProps) => {
        return toast.success(title, {
          description,
          action: action
            ? {
                label: action.label,
                onClick: action.onClick,
              }
            : undefined,
        })
      },
      error: ({ title, description, action }: ToastProps) => {
        return toast.error(title, {
          description,
          action: action
            ? {
                label: action.label, 
                onClick: action.onClick,
              }
            : undefined,
        })
      },
      info: ({ title, description, action }: ToastProps) => {
        return toast.info(title, {
          description,
          action: action
            ? {
                label: action.label,
                onClick: action.onClick,
              }
            : undefined,
        })
      },
      warning: ({ title, description, action }: ToastProps) => {
        return toast.warning(title, {
          description,
          action: action
            ? {
                label: action.label,
                onClick: action.onClick,
              }
            : undefined,
        })
      },
      default: ({ title, description, action }: ToastProps) => {
        return toast(title, {
          description,
          action: action
            ? {
                label: action.label,
                onClick: action.onClick,
              }
            : undefined,
        })
      },
    },
  }
}

// Direct exports for convenience
export const {
  toast: { success: toastSuccess, error: toastError, info: toastInfo, warning: toastWarning, default: toastDefault }
} = useToast()