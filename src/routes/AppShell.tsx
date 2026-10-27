import { NavLink, Outlet } from 'react-router-dom'
import { HomeIcon, PeopleIcon, PlusIcon } from '@/components/icons'
import { useCapture } from '@/features/capture'
import { cn } from '@/lib/cn'

const links = [
  { to: '/', label: 'Home', Icon: HomeIcon, end: true },
  { to: '/people', label: 'People', Icon: PeopleIcon, end: false },
]

function Wordmark() {
  return (
    <div className="font-display flex items-center gap-2 text-2xl">
      <svg aria-hidden viewBox="0 0 32 20" className="text-accent w-7" fill="none">
        <path
          d="M2 14C10 -2 18 22 30 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="30" cy="6" r="2.4" fill="currentColor" />
      </svg>
      Okuru
    </div>
  )
}

export function AppShell() {
  const { openCapture } = useCapture()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex min-h-11 items-center gap-3 rounded-full px-4 text-[0.95rem] transition-colors',
      isActive ? 'bg-accent-soft text-accent-strong' : 'text-ink-soft hover:bg-sunken',
    )

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only-focusable bg-ink text-paper fixed top-2 left-2 z-[70] rounded-full px-4 py-2"
      >
        Skip to content
      </a>

      {/* Side nav: tablet and up */}
      <aside className="border-line bg-paper fixed inset-y-0 left-0 z-30 hidden w-[var(--nav-width)] flex-col gap-8 border-r px-4 py-8 md:flex">
        <div className="px-2">
          <Wordmark />
        </div>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {links.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => openCapture()}
          className="bg-accent text-on-accent shadow-card hover:bg-accent-strong mt-auto flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-medium"
        >
          <PlusIcon /> Note something
        </button>
      </aside>

      <main
        id="main"
        className="pt-safe pb-[calc(var(--tab-height)+env(safe-area-inset-bottom)+1.5rem)] md:pb-12 md:pl-[var(--nav-width)]"
      >
        <Outlet />
      </main>

      {/* Bottom tabs: mobile */}
      <nav
        aria-label="Main"
        className="pb-safe border-line bg-paper/95 fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur md:hidden"
      >
        <ul className="mx-auto grid h-[var(--tab-height)] max-w-md grid-cols-3 items-center">
          <li className="grid place-items-center">
            <NavLink to="/" end className={tabClass}>
              <HomeIcon /> Home
            </NavLink>
          </li>
          <li className="grid place-items-center">
            <button
              type="button"
              onClick={() => openCapture()}
              aria-label="Note something"
              className="bg-accent text-on-accent shadow-card ring-paper -mt-6 grid size-14 place-items-center rounded-full ring-4 active:scale-95 motion-safe:transition-transform"
            >
              <PlusIcon width={26} height={26} />
            </button>
          </li>
          <li className="grid place-items-center">
            <NavLink to="/people" className={tabClass}>
              <PeopleIcon /> People
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  )
}

const tabClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex min-h-11 min-w-16 flex-col items-center justify-center gap-0.5 rounded-md px-3 text-xs',
    isActive ? 'text-accent-strong' : 'text-ink-soft',
  )
