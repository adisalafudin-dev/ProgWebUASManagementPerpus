import { Component } from "react";
import Icon from "./Icon";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    
    // Log error to console for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-cream px-4">
          <div className="max-w-lg rounded-lg border border-borderSoft bg-white p-8 text-center shadow-book">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accentHover">
              <Icon name="alert" className="h-8 w-8" strokeWidth={2} />
            </div>
            
            <h1 className="font-playfair text-2xl font-bold text-textMain mb-3">
              Terjadi Kesalahan
            </h1>
            
            <p className="font-crimson text-textSecondary mb-6">
              Maaf, terjadi kesalahan yang tidak terduga. Silakan coba lagi atau
              hubungi tim dukungan jika masalah berlanjut.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-accentHover mb-2">
                  Lihat Detail Error
                </summary>
                <div className="bg-cream p-3 rounded text-xs font-mono text-textSecondary overflow-auto max-h-40">
                  <p className="font-bold mb-1">{this.state.error.toString()}</p>
                  <pre className="whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="btn-primary"
                onClick={this.handleReset}
              >
                <Icon name="refresh" className="w-4 h-4" strokeWidth={2} />
                Muat Ulang Halaman
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.history.back()}
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
