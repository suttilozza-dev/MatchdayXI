import { Link, createFileRoute } from '@tanstack/react-router'
import Board from '#/components/Board'

export const Route = createFileRoute('/board')({
  head: () => ({ meta: [{ title: 'The board · MATCHDAY XI' }] }),
  component: BoardPage,
})

function BoardPage() {
  return (
    <div>
      <header className="mx-auto max-w-[1400px] px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold">MATCHDAY <span style={{ color: 'var(--boot-lime)' }}>XI</span></Link>
      </header>
      <Board />
    </div>
  )
}
