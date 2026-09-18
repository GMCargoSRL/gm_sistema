'use client'
import Link from 'next/link'

export default function HomeModulosPage() {
  return (
    <div className="w-full space-y-6">
      
      {/* Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-800 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Panel Principal - GM CARGO SRL</h1>
          <p className="text-sky-100 text-sm mt-1">Selecciona el sector o servicio de comercio exterior que deseas gestionar.</p>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-semibold border border-white/20">
          ComEX & Logística Internacional
        </div>
      </div>

      {/* Cuadrícula de Servicios / Módulos Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* TRANSPORTE TERRESTRE */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-inner group-hover:scale-105 transition-transform">
              🚛
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">Transporte Terrestre</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Gestión de camiones, unidades, flotas y emisión de Cartas de Porte Internacional (CRT).
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-[11px] text-gray-400 font-medium">Terrestre / CRT</span>
            <Link 
              href="/crt" 
              className="bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              Abrir
            </Link>
          </div>
        </div>

        {/* TRANSPORTE MARÍTIMO */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-inner group-hover:scale-105 transition-transform">
              🚢
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">Transporte Marítimo</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Coordinación de retiros de contenedores, BLs y seguimiento con portales de navieras.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-[11px] text-gray-400 font-medium">Contenedores</span>
            <Link 
              href="/despachos" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              Abrir
            </Link>
          </div>
        </div>

        {/* TRANSPORTE AÉREO */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-inner group-hover:scale-105 transition-transform">
              ✈️
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">Transporte Aéreo</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Control de guías aéreas, cargas urgentes y documentación de operaciones internacionales.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-[11px] text-gray-400 font-medium">Aéreos GM</span>
            <span className="bg-gray-100 dark:bg-slate-800 text-gray-400 px-3 py-1 rounded-xl text-xs font-semibold cursor-not-allowed">
              Pronto
            </span>
          </div>
        </div>

        {/* DESPACHO ADUANA */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center text-2xl font-bold mb-4 shadow-inner group-hover:scale-105 transition-transform">
              📋
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2">Despacho Aduana</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              Carga de despachos, permisos de embarque, interacciones con ARCA y control aduanero.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-[11px] text-gray-400 font-medium">ARCA / Trámite</span>
            <Link 
              href="/despachos" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              Abrir
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}