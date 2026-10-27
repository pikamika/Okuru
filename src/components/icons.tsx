import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const HomeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z" />
  </svg>
)
export const PeopleIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="9" r="3.2" />
    <path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6" />
    <path d="M15.5 6.4a3 3 0 0 1 0 5.4M17 14.6c1.8.5 3 1.9 3.5 4.4" />
  </svg>
)
export const PlusIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const MicIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="9" y="3.5" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5" />
  </svg>
)
export const ShareIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 15V4m0 0L8 8m4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
  </svg>
)
export const ChevronLeftIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="m14.5 6-6 6 6 6" />
  </svg>
)
export const ChevronRightIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </svg>
)
export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
)
export const CloseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
)
