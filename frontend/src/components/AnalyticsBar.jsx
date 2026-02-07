const AnalyticsBar = ({
  title = "Total Bins",
  content,
  showImg,
  className,
  loading = false, // Changed default to false
}) => {
  return (
    <div
      className={`flex justify-between items-center w-full rounded-md px-4 py-2 bg-green-100 border border-primary/50 shadow-sm ${className}`}
    >
      <div className="flex flex-col justify-center py-0.5 gap-2">
        {/* Title with proper loading skeleton */}
        {loading ? (
          <div className="animate-pulse bg-primary/30 rounded h-5 w-24"></div>
        ) : (
          <p className="font-outfit text-lg text-primary">{title}</p>
        )}

        {/* Content with proper loading skeleton */}
        {loading ? (
          <div className="animate-pulse bg-forest/30 rounded h-8 w-36"></div>
        ) : (
          <p className="font-outfit text-2xl font-bold text-forest">
            {content}
          </p>
        )}
      </div>

      {/* Image with loading state */}
      {showImg && (
        <>
          <img src="trash2.png" className="size-14" alt="" />
        </>
      )}
    </div>
  );
};

export default AnalyticsBar;
