import { Warning } from "@phosphor-icons/react";
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { buttonClasses } from "@/shared/components/Button";
import { Icon } from "@/shared/components/Icon";

/**
 * Route-level error UI (§11). Rendered by React Router as a route `errorElement`
 * so a thrown render/loader error in one route does not blank the whole app.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();

  let title = "Something went wrong";
  let detail = "An unexpected error occurred while rendering this page.";

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    detail = error.data?.message ?? detail;
  } else if (error instanceof Error) {
    detail = error.message;
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <Icon
        as={Warning}
        size="lg"
        weight="duotone"
        className="mx-auto mb-4 block text-primary-deep"
      />
      <h1 className="text-3xl font-bold text-ink">{title}</h1>
      <p className="mt-4 text-ink-soft">{detail}</p>
      <Link to="/" className={buttonClasses("primary", "md", "mt-8")}>
        Back to Home
      </Link>
    </section>
  );
}

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

/**
 * Generic class error boundary for wrapping non-route subtrees (e.g. a single
 * widget) so a crash there is contained.
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("AppErrorBoundary caught an error:", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <p className="px-4 py-8 text-center text-ink-soft">
            This section failed to load.
          </p>
        )
      );
    }
    return this.props.children;
  }
}
