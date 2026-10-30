import { Component } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

/**
 * Last line of defense: if a render error happens, show a recovery screen
 * instead of leaving the page blank.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected UI error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }
    return (
      <div className="crash-screen">
        <div className="crash-card">
          <span className="modal-icon modal-icon--danger">
            <TriangleAlert size={22} />
          </span>
          <h2>Something went wrong</h2>
          <p className="muted">
            The page hit an unexpected error. If you are using an automatic translator, turn it off for this site and
            reload.
          </p>
          <button type="button" className="btn btn-primary btn-block" onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
            <span>Reload page</span>
          </button>
        </div>
      </div>
    );
  }
}
