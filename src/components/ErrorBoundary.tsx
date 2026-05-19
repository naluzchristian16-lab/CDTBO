import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error("ErrorBoundary caught error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#3B1F0E",
          color: "#FAF6EF",
          padding: 20,
          textAlign: "center",
          fontFamily: "'Barlow', sans-serif",
          overflow: "auto",
        }}>
          <div style={{ fontSize: 64, marginBottom: 20, lineHeight: 1 }}>⚠️</div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 12,
            color: "#C0622A",
            letterSpacing: "0.5px",
          }}>
            SOMETHING WENT WRONG
          </div>
          <div style={{
            fontSize: 14,
            color: "#C8A98A",
            marginBottom: 24,
            maxWidth: 500,
            wordBreak: "break-word",
            lineHeight: 1.5,
            fontFamily: "'Barlow', sans-serif",
          }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </div>

          {/* Show more details in development */}
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              marginBottom: 24,
              textAlign: "left",
              background: "#5a302050",
              padding: 12,
              borderRadius: 6,
              maxWidth: 600,
              fontSize: 11,
              color: "#F5ECD7",
            }}>
              <summary style={{ cursor: "pointer", marginBottom: 8, fontWeight: 600 }}>
                Error Details
              </summary>
              <pre style={{
                overflow: "auto",
                fontSize: 10,
                lineHeight: 1.4,
                margin: 0,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 28px",
              background: "#C0622A",
              border: "none",
              borderRadius: 8,
              color: "#FAF6EF",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "'Barlow', sans-serif",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = "#E07D47";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "#C0622A";
            }}
          >
            🔄 Reload Page
          </button>

          <div style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #5a3020",
            fontSize: 11,
            color: "#8A6040",
          }}>
            <div style={{ marginBottom: 8 }}>
              Need help? Check the browser console (F12) for more details.
            </div>
            <div>
              If the problem persists, try clearing your cache or contacting support.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
