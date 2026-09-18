'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface DespachoItem {
  ej?: string
  tipo?: string
  numero: string
  cliente?: string
  ref_cliente?: string
  destinacion?: string
  fecha?: string
  descripcion?: string
  cuit_importador?: string
  aduana_registro?: string
  valor_fob?: string
  flete?: string
  seguro?: string
  incoterm?: string
  pais_destino?: string
  tipo_doc?: string
  ref_doc?: string
  ncm?: string
  descripcion_sbt?: string
}

type SortField = 'ej' | 'tipo' | 'numero' | 'cliente' | 'ref_cliente' | 'destinacion' | 'fecha' | 'descripcion'
type SortOrder = 'asc' | 'desc'

export default function DespachosPage() {
  const [despachos, setDespachos] = useState<DespachoItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [busqueda, setBusqueda] = useState<string>('')
  const [sortField, setSortField] = useState<SortField>('numero')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const fetchDespachos = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('despachos').select('*')

    if (error) {
      console.error('Error al cargar despachos:', error.message)
    } else if (data) {
      setDespachos(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDespachos()
  }, [])

  const handleDelete = async (numero: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el despacho ${numero}?`)) return

    const { error } = await supabase.from('despachos').delete().eq('numero', numero)
    if (error) {
      alert(`Error al eliminar: ${error.message}`)
    } else {
      setDespachos((prev) => prev.filter((item) => item.numero !== numero))
    }
  }

  const handleDescargarTxtDirecto = (item: DespachoItem) => {
    const contenidoTxt = `[DDT]
NDDTIMMIOE=${item.cuit_importador || ''}
CDDTAGR=27218155516
ISTA=${item.aduana_registro || 'IC05'}
CDDTBUR=001
CDDTDEVFOB=DOL
MDDTFOB=${item.valor_fob || ''}
MDDTFLE=${item.flete || ''}
CDDTDEVFLE=DOL
CDDTDEVASS=DOL
MDDTASS=${item.seguro || ''}
CDDTIVA=S
CDDTPAIDST=${item.pais_destino || '203'}
CDDTBURDST=001
CDDTFACPAG=N
CDDTINCOTE=${item.incoterm || 'CPT'}
CDDTPRD=N
IEXT=${item.numero}


[DVD]
CDVDDOC=FACTURACOMERCIAL
LDVDREFDOC=${item.ref_doc || ''}
NART=0000


[ART]
CARTUNTDCL=29
QARTUNTDCL=16.95
MARTFOB=${item.valor_fob || ''}
CARTTYP=N
CARTSBITEM=N
IESPNCE=${item.ncm || ''}
NARTEXT=0001
LISTA=Mercosur
CARTUSO=2
CARTPAYORI=${item.pais_destino || '203'}
CARTPAYPRC=${item.pais_destino || '203'}
CARTPAGREG=N
CARTCALDST=N


[SBT]
CSBTSVL=${item.descripcion_sbt || ''}
NART=0001
ISBT=0000
`

    const blob = new Blob([contenidoTxt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${item.numero}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const despachosFiltrados = despachos.filter((item) => {
    const texto = busqueda.toLowerCase()
    return (
      item.numero?.toLowerCase().includes(texto) ||
      item.cliente?.toLowerCase().includes(texto) ||
      item.ref_cliente?.toLowerCase().includes(texto) ||
      item.descripcion?.toLowerCase().includes(texto) ||
      item.tipo?.toLowerCase().includes(texto) ||
      item.destinacion?.toLowerCase().includes(texto) ||
      item.ej?.toLowerCase().includes(texto) ||
      item.fecha?.toLowerCase().includes(texto)
    )
  })

  const despachosOrdenados = [...despachosFiltrados].sort((a, b) => {
    const valA = a[sortField] || ''
    const valB = b[sortField] || ''

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-slate-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Módulo de Despachos</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Listado y gestión general de despachos y operaciones aduaneras de GM CARGO SRL.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por número, cliente, tipo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 w-full sm:w-64"
          />
          <Link
            href="/despachos/nuevo"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap"
          >
            + Nuevo Despacho
          </Link>
        </div>
      </header>

      {/* Tabla de Despachos */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wider">
            Registros de Despachos ({despachosOrdenados.length})
          </h2>
          <span className="text-xs text-gray-400">Haz clic en los encabezados para ordenar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-slate-300 border-collapse">
            <thead className="bg-gray-100 dark:bg-slate-950 text-gray-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th onClick={() => handleSort('ej')} className="p-3 cursor-pointer hover:text-sky-600 transition">
                  Ej {sortField === 'ej' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('tipo')} className="p-3 cursor-pointer hover:text-sky-600 transition">
                  Tipo {sortField === 'tipo' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('numero')} className="p-3 cursor-pointer hover:text-sky-600 transition">
                  Numero {sortField === 'numero' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('cliente')} className="p-3 cursor-pointer hover:text-sky-600 transition">
                  Cliente {sortField === 'cliente' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('ref_cliente')} className="p-3 cursor-pointer hover:text-sky-600 transition">
                  Ref.Cliente {sortField === 'ref_cliente' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('destinacion')} className="p-3 cursor-pointer hover:text-sky-600 transition">
                  Destinacion {sortField === 'destinacion' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('fecha')} className="p-3 cursor-pointer hover:text-sky-600 transition">
                  Fecha {sortField === 'fecha' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th onClick={() => handleSort('descripcion')} className="p-3 cursor-pointer hover:text-sky-600 transition">
                  Descripcion {sortField === 'descripcion' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-400">
                    Cargando registros de despachos...
                  </td>
                </tr>
              ) : despachosOrdenados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-400">
                    No se encontraron registros de despachos guardados.
                  </td>
                </tr>
              ) : (
                despachosOrdenados.map((item) => (
                  <tr key={item.numero} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3">{item.ej || '—'}</td>
                    <td className="p-3 font-semibold text-sky-600 dark:text-sky-400">{item.tipo || '—'}</td>
                    <td className="p-3 font-mono font-bold text-gray-900 dark:text-white">{item.numero || '—'}</td>
                    <td className="p-3 font-medium text-gray-800 dark:text-slate-200">{item.cliente || '—'}</td>
                    <td className="p-3">{item.ref_cliente || '—'}</td>
                    <td className="p-3">{item.destinacion || '—'}</td>
                    <td className="p-3">{item.fecha || '—'}</td>
                    <td className="p-3 max-w-xs truncate" title={item.descripcion}>{item.descripcion || '—'}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/despachos/editar/${encodeURIComponent(item.numero)}`}
                          className="bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 px-2.5 py-1 rounded-lg hover:bg-sky-200 transition text-[11px] font-semibold"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDescargarTxtDirecto(item)}
                          className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg hover:bg-emerald-200 transition text-[11px] font-semibold"
                          title="Descargar TXT Sistema María"
                        >
                          TXT
                        </button>
                        <button
                          onClick={() => handleDelete(item.numero)}
                          className="bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-200 transition text-[11px] font-semibold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}