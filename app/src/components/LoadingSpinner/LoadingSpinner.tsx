import './LoadingSpinner-style.css';

export function LoadingSpinner() {
    return (
        <div className="loader-overlay">
            <div className="loader-container">
                <div className="loader-glow" />
                <div className="loader-circle" />
                <img
                    src="/favicon.png"
                    alt="Loading..."
                    className="loader-logo"
                />
            </div>
        </div>
    );
}
