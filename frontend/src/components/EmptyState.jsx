import Icon from "./Icon";

export default function EmptyState({
  icon = "collection",
  title = "Tidak ada data",
  description = "Data belum tersedia saat ini.",
  action = null,
  actionLabel = "Kembali",
  onAction = null,
}) {
  return (
    <div className="rounded-lg border border-borderSoft bg-white p-8 text-center shadow-book">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-cream text-accentHover">
        <Icon name={icon} className="h-7 w-7" strokeWidth={2} />
      </div>
      <h3 className="font-playfair text-lg font-semibold text-textMain mb-2">
        {title}
      </h3>
      <p className="font-crimson text-sm text-textSecondary max-w-md mx-auto mb-5">
        {description}
      </p>
      {action && onAction && (
        <button type="button" className="btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
