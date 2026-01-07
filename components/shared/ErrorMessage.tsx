import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorMessageProps {
  message: string;
  retry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, retry, className }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 px-4 text-center bg-red-500/10 rounded-xl border border-red-500/20",
        className
      )}
    >
      <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
      <p className="text-red-400 font-medium mb-2">Something went wrong</p>
      <p className="text-sm text-white/50 max-w-sm mb-4">{message}</p>
      {retry && (
        <Button onClick={retry} variant="secondary" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
}
