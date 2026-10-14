import {
  FileSpreadsheet,
  FileUp,
  UploadCloud,
  X,
} from "lucide-react";
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";

import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassCard } from "../../../components/ui/GlassCard";

interface ImportUploadStepProps {
  onFileSelected: (file: File) => void;
  onCancel?: () => void;
  disabled?: boolean;
}

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls"];

function isSupportedFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();

  return ACCEPTED_EXTENSIONS.some((extension) =>
    lowerName.endsWith(extension),
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportUploadStep({
  onFileSelected,
  onCancel,
  disabled = false,
}: ImportUploadStepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!isSupportedFile(file)) {
        setSelectedFile(null);

        setError(
          "Unsupported file type. Please choose a CSV, XLSX, or XLS file.",
        );

        return;
      }

      if (file.size === 0) {
        setSelectedFile(null);

        setError("This file is empty.");

        return;
      }

      setSelectedFile(file);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      processFile(file);
    }

    event.target.value = "";
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    if (disabled) {
      return;
    }

    const file = event.dataTransfer.files?.[0];

    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  const openFilePicker = () => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-emerald-400">
            <FileSpreadsheet size={20} strokeWidth={1.8} />
          </div>

          <div>
            <h2 className="text-base font-semibold text-white">
              Import product catalogue
            </h2>

            <p className="text-sm text-neutral-400">
              Upload your existing product list to get started.
            </p>
          </div>
        </div>
      </div>

      {/* Upload area */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "group relative flex min-h-[280px] cursor-pointer",
          "flex-col items-center justify-center",
          "rounded-3xl border border-dashed",
          "px-6 py-10 text-center",
          "transition-all duration-200",
          "outline-none",
          "focus-visible:ring-2 focus-visible:ring-emerald-400/50",
          disabled
            ? "cursor-not-allowed border-white/5 bg-white/[0.02] opacity-50"
            : isDragging
              ? "border-emerald-400/60 bg-emerald-400/[0.08]"
              : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.04]",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div
          className={[
            "mb-5 flex size-16 items-center justify-center rounded-3xl",
            "border transition-all duration-200",
            isDragging
              ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
              : "border-white/10 bg-white/[0.05] text-neutral-300 group-hover:border-white/20 group-hover:text-white",
          ].join(" ")}
        >
          {isDragging ? (
            <UploadCloud
              size={28}
              strokeWidth={1.7}
            />
          ) : (
            <FileUp
              size={28}
              strokeWidth={1.7}
            />
          )}
        </div>

        <h3 className="text-sm font-semibold text-white">
          {isDragging
            ? "Drop your catalogue here"
            : "Drop your catalogue here"}
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-400">
          Or click to browse files from your computer.
          Your catalogue is processed locally before
          anything is imported into BizTru.
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {["CSV", "XLSX", "XLS"].map((type) => (
            <span
              key={type}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-neutral-400"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Selected file */}
      {selectedFile && (
        <GlassCard className="mt-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
              <FileSpreadsheet
                size={19}
                strokeWidth={1.8}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {selectedFile.name}
              </p>

              <p className="mt-0.5 text-xs text-neutral-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                clearFile();
              }}
              disabled={disabled}
              aria-label="Remove selected file"
              className="flex size-8 shrink-0 items-center justify-center rounded-xl text-neutral-500 transition-colors hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        </GlassCard>
      )}

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3"
        >
          <p className="text-sm text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* Help */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
        <div className="mt-0.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />

        <p className="text-xs leading-5 text-neutral-500">
          BizTru will first read the column names and
          validate your catalogue. No products or stock
          will be changed until you review and approve
          the import.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
        <div>
          {onCancel && (
            <GlassButton
              type="button"
              variant="tertiary"
              onClick={onCancel}
              disabled={disabled}
            >
              Cancel
            </GlassButton>
          )}
        </div>

        <GlassButton
          type="button"
          onClick={openFilePicker}
          disabled={disabled}
          className="min-w-[150px]"
        >
          <FileUp size={17} />
          Choose file
        </GlassButton>
      </div>
    </div>
  );
}