import { Component } from "react";

export default class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background p-8 text-foreground">
          <h1 className="title text-2xl">Something went wrong</h1>
          <pre className="mt-4 max-w-prose overflow-auto whitespace-pre-wrap text-sm text-destructive">
            {this.state.error?.message ?? String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
