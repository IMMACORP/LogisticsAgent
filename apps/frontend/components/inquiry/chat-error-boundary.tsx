"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface ChatErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface ChatErrorBoundaryState {
  hasError: boolean;
  message?: string;
}

export class ChatErrorBoundary extends Component<
  ChatErrorBoundaryProps,
  ChatErrorBoundaryState
> {
  state: ChatErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Chat panel error", error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <aside className="flex h-full flex-col items-center justify-center border-l border-border bg-slate-50 p-6 text-center">
          <p className="text-sm font-semibold text-[#1e3a5f]">
            チャットの表示で問題が発生しました
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {this.state.message ?? "不明なエラー"}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={this.handleReset}
          >
            チャットを再読み込み
          </Button>
        </aside>
      );
    }

    return this.props.children;
  }
}
