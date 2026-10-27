import { Outlet, useMatch } from 'react-router-dom'
import { Page } from '@/components'
import { cn } from '@/lib/cn'
import { PeopleList } from './PeopleList'

/** Mobile: list or profile. Wide: list on the left, notebook on the right. */
export function PeopleLayout() {
  const onProfile = useMatch('/people/:personId/*') !== null
  return (
    <Page wide>
      <div className="lg:grid lg:grid-cols-[18rem_1fr] lg:gap-12">
        <div className={cn(onProfile && 'hidden lg:block')}>
          <PeopleList />
        </div>
        <div className={cn(!onProfile && 'hidden lg:block', 'min-w-0')}>
          <Outlet />
        </div>
      </div>
    </Page>
  )
}

/** Shown in the right pane on wide screens before anyone is chosen. */
export function PeopleIndexPane() {
  return (
    <p className="font-display text-ink-faint hidden pt-24 text-center text-xl lg:block">
      Choose someone to open their notebook.
    </p>
  )
}
