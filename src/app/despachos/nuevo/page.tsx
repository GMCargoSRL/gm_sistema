'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function NuevoDespachoPage() {
  const [formData, setFormData] = useState({
    ej: '26',
    tipo: 'GMCI',
    numero: '',
    cliente: '',
    ref_cliente: '',
    destinacion: '',
    fecha: new Date().toLocaleDateString('es-AR'),
    descripcion: '',
    cuit_importador: '',
    aduana_registro: '',
    valor_fob: '',
    flete: '',
    seguro: '',
    incoterm: '',
    pais_destino: '',
    tipo_doc: '',
    ref_doc: '',
    fecha_emision_fact: '',
    domicilio_establec: '',
    localidad_prov: '',
    fecha_inic_activ: '',
    unidades: '',
    precio_unitario: '',
    peso_neto: '',
    ncm: '',
    descripcion_sbt: '',
  })

  const [guardando, setGuardando] = useState(false)

  const calcularCorrelativo = async (tipoOp: string) => {
    const anioActual = '26'
    const prefijo = `${anioActual}-${tipoOp}-`

    const { data, error } = await supabase
      .from('despachos')
      .select('numero')
      .ilike('numero', `${prefijo}%`)
      .order('numero', { ascending: false })
      .limit(1)

    if (error || !data || data.length === 0) {
      return `${prefijo}00001`
    }

    const ultimoNumeroStr = data[0].numero
    const partes = ultimoNumeroStr.split('-')
    const ultimoSecuencial = parseInt(partes[partes.length - 1], 10)

    if (isNaN(ultimoSecuencial)) {
      return `${prefijo}00001`
    }

    const siguienteSecuencial = (ultimoSecuencial + 1).toString().padStart(5, '0')
    return `${prefijo}${siguienteSecuencial}`
  }

  useEffect(() => {
    calcularCorrelativo(formData.tipo).then((nuevoNumero) => {
      setFormData((prev) => ({ ...prev, numero: nuevoNumero }))
    })
  }, [formData.tipo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const generarTxtMaria = () => {
    return `[DDT]
NDDTIMMIOE=${formData.cuit_importador}
CDDTAGR=27218155516
ISTA=${formData.aduana_registro}
CDDTBUR=001
CDDTDEVFOB=DOL
MDDTFOB=${formData.valor_fob}
MDDTFLE=${formData.flete}
CDDTDEVFLE=DOL
CDDTDEVASS=DOL
MDDTASS=${formData.seguro}
CDDTIVA=S
CDDTPAIDST=${formData.pais_destino}
CDDTBURDST=001
CDDTFACPAG=N
CDDTINCOTE=${formData.incoterm}
CDDTPRD=N
IEXT=${formData.numero}


[DVD]
CDVDDOC=${formData.tipo_doc}
LDVDREFDOC=${formData.ref_doc}
NART=0000


[CPL]
ICPLDIF=D
CCPL=FECHAEMISIONFACT
MCPL=${formData.fecha_emision_fact}
NART=0000


[CPL]
ICPLDIF=D
CCPL=DOMICIL.ESTABLEC
MCPL=${formData.domicilio_establec}
NART=0000


[CPL]
ICPLDIF=D
CCPL=LOCALIDAD/PROVIN
MCPL=${formData.localidad_prov}
NART=0000


[CPL]
ICPLDIF=D
CCPL=FECHA INIC.ACTIV
MCPL=${formData.fecha_inic_activ}
NART=0000


[ART]
CARTUNTDCL=29
QARTUNTDCL=16.95
QARTUNTEST=${formData.unidades}
MARTUNITAR=${formData.precio_unitario}
QARTKGRNET=${formData.peso_neto}
MARTFOB=${formData.valor_fob}
CARTTYP=N
CARTSBITEM=N
IESPNCE=${formData.ncm}
NARTEXT=0001
LISTA=Mercosur
CARTUSO=2
CARTPAYORI=${formData.pais_destino}
CARTPAYPRC=${formData.pais_destino}
CARTPAGREG=N
CARTCALDST=N


[SBT]
CSBTSVL=${formData.descripcion_sbt}
NART=0001
ISBT=0000
`
  }

  const handleDescargarTxt = () => {
    const contenidoTxt = generarTxtMaria()
    const blob = new Blob([contenidoTxt], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${formData.numero}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    const { error } = await supabase.from('despachos').upsert([
      {
        ej: formData.ej,
        tipo: formData.tipo,
        numero: formData.numero,
        cliente: formData.cliente,
        ref_cliente: formData.ref_cliente,
        destinacion: formData.destinacion,
        fecha: formData.fecha,
        descripcion: formData.descripcion,
        cuit_importador: formData.cuit_importador,
        aduana_registro: formData.aduana_registro,
        valor_fob: formData.valor_fob,
        flete: formData.flete,
        seguro: formData.seguro,
        incoterm: formData.incoterm,
        pais_destino: formData.pais_destino,
        tipo_doc: formData.tipo_doc,
        ref_doc: formData.ref_doc,
        fecha_emision_fact: formData.fecha_emision_fact,
        domicilio_establec: formData.domicilio_establec,
        localidad_prov: formData.localidad_prov,
        fecha_inic_activ: formData.fecha_inic_activ,
        unidades: formData.unidades,
        precio_unitario: formData.precio_unitario,
        peso_neto: formData.peso_neto,
        ncm: formData.ncm,
        descripcion_sbt: formData.descripcion_sbt,
      },
    ])

    if (error) {
      alert(`Error al guardar en base de datos: ${error.message}`)
      setGuardando(false)
      return
    }

    handleDescargarTxt()
    setGuardando(false)
    alert('¡Despacho guardado y archivo TXT para MARIA generado con éxito!')
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      <header className="flex justify-between items-center border-b border-gray-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Nuevo Despacho & Exportación TXT MARIA</h1>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            Carga manual con numeración correlativa automática y generación de TXT oficial ARCA.
          </p>
        </div>
        <Link
          href="/despachos"
          className="bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
        >
          ← Volver al Listado
        </Link>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Datos Generales de la Operación */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            1. Datos Generales de la Operación
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Ej</label>
              <input
                type="text"
                name="ej"
                value={formData.ej}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Tipo de Operación</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-bold"
              >
                <option value="GMCI">GMCI (Importación)</option>
                <option value="GMCE">GMCE (Exportación)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Número Correlativo (IEXT)</label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2.5 bg-sky-50 dark:bg-slate-800/80 border border-sky-300 dark:border-sky-700 rounded-xl text-xs font-bold text-sky-900 dark:text-sky-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Cliente</label>
              <input
                type="text"
                name="cliente"
                value={formData.cliente}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Ref. Cliente</label>
              <input
                type="text"
                name="ref_cliente"
                value={formData.ref_cliente}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Destinación</label>
              <input
                type="text"
                name="destinacion"
                value={formData.destinacion}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Fecha</label>
              <input
                type="text"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Descripción General (Factura)</label>
              <input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* 2. Datos Técnicos para el TXT de ARCA (Sistema María) */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            2. Datos Técnicos para el TXT de ARCA (Sistema María)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-500">CUIT Importador/Exportador (NDDTIMMIOE)</label>
              <input
                type="text"
                name="cuit_importador"
                value={formData.cuit_importador}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Aduana de Registro (ISTA)</label>
              <input
                type="text"
                name="aduana_registro"
                value={formData.aduana_registro}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Valor FOB (MDDTFOB)</label>
              <input
                type="text"
                name="valor_fob"
                value={formData.valor_fob}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Flete (MDDTFLE)</label>
              <input
                type="text"
                name="flete"
                value={formData.flete}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Seguro (MDDTASS)</label>
              <input
                type="text"
                name="seguro"
                value={formData.seguro}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Incoterm (CDDTINCOTE)</label>
              <input
                type="text"
                name="incoterm"
                value={formData.incoterm}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">País Destino / Origen</label>
              <input
                type="text"
                name="pais_destino"
                value={formData.pais_destino}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Unidades Estadísticas (QARTUNTEST)</label>
              <input
                type="text"
                name="unidades"
                value={formData.unidades}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Precio Unitario (MARTUNITAR)</label>
              <input
                type="text"
                name="precio_unitario"
                value={formData.precio_unitario}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Peso Neto (QARTKGRNET)</label>
              <input
                type="text"
                name="peso_neto"
                value={formData.peso_neto}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Posición NCM (IESPNCE)</label>
              <input
                type="text"
                name="ncm"
                value={formData.ncm}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Referencia Factura (LDVDREFDOC)</label>
              <input
                type="text"
                name="ref_doc"
                value={formData.ref_doc}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-gray-500">Tipo de Documento (CDVDDOC)</label>
              <input
                type="text"
                name="tipo_doc"
                value={formData.tipo_doc}
                onChange={handleChange}
                className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-500">Subítem / Descripción Detallada ([SBT])</label>
            <textarea
              name="descripcion_sbt"
              rows={3}
              value={formData.descripcion_sbt}
              onChange={handleChange}
              className="w-full mt-1 p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-800 dark:text-slate-200 font-mono"
            />
          </div>
        </div>

        {/* Botón de Guardado y Descarga */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {guardando ? 'Guardando y Generando...' : '💾 Guardar Despacho y Descargar TXT para MARIA'}
          </button>
        </div>
      </form>
    </div>
  )
}