'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import './globals.css'
import { metadata } from './layout-metadata'
import { Toaster } from 'sonner'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [fechaHoraActual, setFechaHoraActual] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const actualizarReloj = () => {
      const ahora = new Date()
      setFechaHoraActual(ahora.toLocaleString('es-AR', {
        dateStyle: 'full',
        timeStyle: 'medium'
      }))
    }
    actualizarReloj()
    const timer = setInterval(actualizarReloj, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-x-hidden m-0 p-0 transition-colors duration-300" suppressHydrationWarning>
        
        {/* Marca de agua repetida de fondo */}
        <div className="fixed inset-0 pointer-events-none z-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 p-6 opacity-5 dark:opacity-10 dark:invert overflow-hidden w-full h-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center p-2">
              <span className="text-2xl font-bold grayscale -rotate-12 select-none">GM CARGO</span>
            </div>
          ))}
        </div>

        {/* Overlay oscuro cuando la barra lateral está abierta */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Barra Lateral (Sidebar) con Módulos Operativos de la Empresa */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          transition-transform duration-300 ease-in-out bg-slate-900 text-white shadow-2xl flex flex-col h-screen
        `}>
          <div className="p-6 font-bold text-lg border-b border-white/10 flex justify-between items-center">
            <span>GM CARGO - Módulos</span>
            <button className="p-2 text-slate-400 hover:text-white cursor-pointer" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>
          
          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            <Link 
              href="/" 
              className="block p-3 bg-sky-600 hover:bg-sky-700 rounded-xl text-white font-semibold transition-colors shadow-xs" 
              onClick={() => setSidebarOpen(false)}
            >
              📊 Panel Principal
            </Link>
            
            <div className="pt-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-3">Funcionalidades</div>
            
            <Link 
              href="/despachos" 
              className="block p-2.5 hover:bg-white/10 rounded-xl text-slate-300 text-sm transition-colors" 
              onClick={() => setSidebarOpen(false)}
            >
              📦 Carga de Despachos
            </Link>
            
            <Link 
              href="/flotas" 
              className="block p-2.5 hover:bg-white/10 rounded-xl text-slate-300 text-sm transition-colors" 
              onClick={() => setSidebarOpen(false)}
            >
              🚛 Flotas y Unidades
            </Link>
            
            <Link 
              href="/crt" 
              className="block p-2.5 hover:bg-white/10 rounded-xl text-slate-300 text-sm transition-colors" 
              onClick={() => setSidebarOpen(false)}
            >
              📜 Cartas de Porte (CRT)
            </Link>
          </nav>

          <div className="p-4 border-t border-white/10 text-xs text-slate-400">
            Sistema de Gestión Integral
          </div>
        </aside>

        {/* Encabezado Fijo superior */}
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xs p-4 flex justify-between items-center fixed top-0 left-0 right-0 z-30 w-full border-b border-gray-200 dark:border-slate-800">
          <div className="flex items-center">
            <button 
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="ml-4 font-bold text-slate-800 dark:text-slate-100">GM CARGO SRL - Sistema de Gestión</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hidden sm:block">
              {mounted ? fechaHoraActual : ''}
            </div>
          </div>
        </header>

        {/* Vista principal */}
        <div className="flex flex-col min-h-screen w-full pt-16 relative z-10">
          <main className="flex-1 w-full p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </main>
        </div>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}