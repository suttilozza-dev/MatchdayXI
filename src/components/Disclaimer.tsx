export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={className ?? 'text-xs text-[#A9B4D0] max-w-3xl'}>
      <b>Disclaimer.</b> MATCHDAY XI is an independent, fan-made tool. It is not affiliated with, endorsed by or connected to the Premier League, any football club, any player or any players' association. Club, player and stadium names are used only to identify the teams and people shown, and all trademarks and other rights belong to their owners. Squad lists, shirt numbers and kit colours are unofficial and may be out of date, so check before you share. No club crests, badges or player photographs are used.
    </p>
  )
}
