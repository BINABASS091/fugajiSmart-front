import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  variant = 'warning',
  confirmText = 'Confirm Strategy',
  cancelText = 'Abort Protocol',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: XCircle,
      iconColor: 'bg-rose-100 text-rose-600',
      buttonBg: 'bg-rose-600 hover:bg-black',
      borderColor: 'border-rose-100',
      shadow: 'shadow-rose-500/10'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'bg-amber-100 text-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-black',
      borderColor: 'border-amber-100',
      shadow: 'shadow-amber-500/10'
    },
    info: {
      icon: Info,
      iconColor: 'bg-indigo-100 text-indigo-600',
      buttonBg: 'bg-indigo-600 hover:bg-black',
      borderColor: 'border-indigo-100',
      shadow: 'shadow-indigo-500/10'
    },
    success: {
      icon: CheckCircle,
      iconColor: 'bg-emerald-100 text-emerald-600',
      buttonBg: 'bg-emerald-600 hover:bg-black',
      borderColor: 'border-emerald-100',
      shadow: 'shadow-emerald-500/10'
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className={`bg-white rounded-[40px] shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn border-none ${style.shadow}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-10 pb-6 flex items-start gap-6 border-b border-gray-50">
          <div className={`p-4 rounded-2xl shrink-0 ${style.iconColor} shadow-lg shadow-gray-200/50`}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none">{title}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Awaiting Manual Override</p>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Body */}
        <div className="p-10 py-12">
          <p className="text-lg font-bold text-gray-500 leading-relaxed uppercase tracking-tight">
            {message}
          </p>
          <div className="mt-8 p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sequence integrity check verified</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-center gap-4 p-10 pt-0">
          <button
            onClick={onCancel}
            className="w-full md:flex-1 py-6 rounded-3xl border border-gray-100 bg-white text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`w-full md:flex-1 py-6 rounded-3xl text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl ${style.buttonBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
