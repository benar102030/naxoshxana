import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error Boundary - بەرپاریی هەڵەکانی نەچاوەڕوانکراو
 * ئەمە پاراستنێکی گشتییە بۆ ئەوەی هەر هەڵەیەک لە React Component ئاڵۆزکاری
 * بۆ تەواوی ئەپڵیکەیشنەکە نەخراپێنێت - لانی کەم بەشی کیشەدارەکە دادەگرێت
 * و پەیامێکی ڕوون بۆ بەکارهێنەر دەنووسێت بۆ ئەوەی دووبارە هەوڵ بدات.
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // لەمەوبەر ئەمە دەتوانیت بنێریت بۆ سێرڤەری تۆمارکردنی هەڵەکان (Sentry, LogRocket)
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                <AlertTriangle className="w-12 h-12 text-rose-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">هەڵەیەک ڕوویدا</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                کێشەیەکی ناچاوەڕوانکراو ڕوویدا. تکایە دووبارە هەوڵ بدەوە،
                ئەگەر مەسەلەکە بەردەوام بوو پەیوەندی بە بەڕێوەبەری سیستەم بکە.
              </p>
              {this.state.error && (
                <p className="text-xs text-muted-foreground/60 bg-muted p-3 rounded-md font-mono text-right mt-3 break-all">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                دووبارە هەوڵ بدەوە
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/"}
              >
                گەڕانەوە بۆ داشبۆرد
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
