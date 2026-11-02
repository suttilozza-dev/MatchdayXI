import { Link, createFileRoute } from '@tanstack/react-router'
import Board from '#/components/Board'
import { HeaderLogo } from '#/components/Logo'

export const Route = createFileRoute('/board')({
  head: () => ({ meta: [{ title: 'The board · MATCHDAY XI' }] }),
  component: BoardPage,
})

function BoardPage() {
  return (
    <div>
      <header className="mx-auto max-w-[1400px] px-4 py-4 flex items-center justify-between">
        <Link to="/" aria-label="Matchday XI home"><HeaderLogo /></Link>
      </header>
      <Board />
    </div>
  )
}
