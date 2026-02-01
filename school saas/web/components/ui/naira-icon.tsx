import { LucideProps } from "lucide-react"
import { forwardRef } from "react"

export const NairaIcon = forwardRef<SVGSVGElement, LucideProps>(
    ({ size = 24, strokeWidth = 2, className, ...props }, ref) => {
        return (
            <svg
                ref={ref}
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={className}
                {...props}
            >
                <path d="M6 3v18" />
                <path d="M6 3l12 18" />
                <path d="M18 3v18" />
                <path d="M4 10h16" />
                <path d="M4 14h16" />
            </svg>
        )
    }
)

NairaIcon.displayName = "NairaIcon"
