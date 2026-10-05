import { createRoot } from 'react-dom/client'
import { ProjectVisual } from '@src/components/sections/ProjectVisual'

/**
 * Mount one of the project visuals into `el`.
 * kinds: sleep (SnoreTrack), pulse (VR CPR), vision (TUG), water (TonNam), farm (Smart Farm),
 *        quake (vibration monitor art), island (Koh Larn art)
 * Returns an unmount function.
 */
export function mount(el: HTMLElement, visual: string) {
  const root = createRoot(el)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  root.render(<ProjectVisual project={{ visual } as any} />)
  return () => root.unmount()
}
