// src/components/common/Button.jsx
/*
 * Enhanced Button component with more customization options
 * Props:
 *  - children: button text or icon
 *  - onClick: click handler
 *  - variant: "primary" | "secondary" | "danger" | "success" | "ghost" | "outline"
 *  - size: "sm" | "md" | "lg" | "xl"
 *  - type: button type (default = "button")
 *  - fullWidth: make button stretch
 *  - disabled: disable button
 *  - loading: show loading state
 *  - icon: icon element to show
 *  - iconPosition: "left" | "right"
 *  - className: additional classes
 */

const variantClasses = {
  primary:
    "bg-maritime-600 text-white hover:bg-maritime-700 hover:shadow-maritime-soft focus:ring-maritime-500/50 active:scale-95 border border-transparent",
  secondary:
    "bg-maritime-50 text-maritime-800 hover:bg-maritime-100 focus:ring-maritime-500/30 active:scale-95 border border-transparent",
  danger:
    "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/50 hover:shadow-md active:scale-95 border border-transparent",
  success: 
    "bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500/50 hover:shadow-md active:scale-95 border border-transparent",
  ghost:
    "bg-transparent text-gray-600 hover:text-maritime-700 hover:bg-maritime-50 focus:ring-maritime-500/30 active:scale-95 border border-transparent",
  outlined:
    "bg-transparent border-2 border-maritime-600 text-maritime-600 hover:bg-maritime-600 hover:text-white hover:shadow-maritime-soft active:scale-95",
  navigation:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50 hover:shadow-md active:scale-95 border border-transparent",
  back: 
    "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:scale-95 shadow-sm",
  forward: 
    "bg-maritime-600 text-white hover:bg-maritime-700 hover:shadow-maritime-soft active:scale-95 border border-transparent",
};

const sizeClasses = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-base px-5 py-2.5 rounded-xl",
  lg: "text-lg px-6 py-3 rounded-2xl",
  xl: "text-xl px-8 py-4 rounded-full",
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  type = "button",
  fullWidth = false,
  disabled = false,
  loading = false,
  small = false, // Deprecated, use size="sm"
  icon,
  iconPosition = "left",
  className = "",
  ...rest
}) {
  const resolvedSize = small ? "sm" : size;
  
  const baseClasses =
    "inline-flex items-center justify-center gap-2 font-medium font-sans transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";

  const finalClasses = `${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[resolvedSize]} ${fullWidth ? "w-full" : ""} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={finalClasses}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && iconPosition === "left" && !loading && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {icon && iconPosition === "right" && !loading && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
}
