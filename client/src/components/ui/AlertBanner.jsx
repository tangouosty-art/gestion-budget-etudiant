export default function AlertBanner({ type = "info", title, children }) {
  return (
    <div className={`alert-banner ${type}`}>
      <div className="alert-banner-content">
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}