'use client'

import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

export function InstallApp() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPromptEvent) }
    const onInstalled = () => { setInstalled(true); setPrompt(null) }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sw.js').catch(() => undefined)
      } else {
        navigator.serviceWorker.getRegistrations().then((registrations) => registrations.forEach((registration) => registration.unregister())).catch(() => undefined)
      }
    }
    return () => { window.removeEventListener('beforeinstallprompt', onBeforeInstall); window.removeEventListener('appinstalled', onInstalled) }
  }, [])

  if (installed) return <p className="text-xs text-white/50">LUPITA já está instalada neste aparelho.</p>
  if (!prompt) return <p className="text-xs text-white/50">No Chrome: abra o menu ⋮ e toque em “Adicionar à tela inicial”.</p>
  return <button type="button" className="admin-primary" onClick={async () => { await prompt.prompt(); const choice = await prompt.userChoice; if (choice.outcome === 'accepted') setPrompt(null) }}>Instalar aplicativo</button>
}
