import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import OpenAI from 'openai'
import PDFParser from 'pdf2json'

export const runtime = 'nodejs'

// Extraer texto plano desde archivos PDF sin dependencias de DOM
function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, true)

    pdfParser.on('pdfParser_dataError', (errData: any) => {
      reject(errData.parserError)
    })

    pdfParser.on('pdfParser_dataReady', () => {
      const rawText = pdfParser.getRawTextContent()
      resolve(rawText)
    })

    pdfParser.parseBuffer(buffer)
  })
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'La API Key de Groq (GROQ_API_KEY) no está configurada.' },
        { status: 500 }
      )
    }

    const groq = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    })

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se recibieron archivos en la solicitud.' },
        { status: 400 }
      )
    }

    let textoConsolidado = ''

    // 1. Extraer texto de cada archivo cargado
    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer())

        if (file.type.includes('pdf') || file.name.endsWith('.pdf')) {
          const pdfText = await extractTextFromPDF(buffer)
          if (pdfText && pdfText.trim()) {
            textoConsolidado += `\n--- INICIO PDF: ${file.name} ---\n${pdfText}\n--- FIN PDF ---\n`
          }
        } else if (
          file.type.includes('sheet') ||
          file.type.includes('excel') ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls') ||
          file.name.endsWith('.csv')
        ) {
          const workbook = XLSX.read(buffer, { type: 'buffer' })
          const sheetName = workbook.SheetNames[0]
          const csvText = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName])
          textoConsolidado += `\n--- INICIO EXCEL: ${file.name} ---\n${csvText}\n--- FIN EXCEL ---\n`
        }
      } catch (fileError: any) {
        console.error(`Error al procesar ${file.name}:`, fileError)
      }
    }

    if (!textoConsolidado.trim()) {
      return NextResponse.json(
        { error: 'No se pudo extraer texto de los archivos. Verifica que no sean escaneos tipo imagen sin OCR.' },
        { status: 400 }
      )
    }

    // 2. Consulta utilizando Qwen 3.8 27B (disponible y habilitado en tu panel)
    const response = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente experto en comercio exterior. Analiza el texto proporcionado y devuelve ÚNICAMENTE un objeto JSON con las claves:
          remitente_razon_social, remitente_direccion, remitente_cuit,
          destinatario_razon_social, destinatario_direccion, destinatario_ruc,
          factura_numero, bultos_cantidad, peso_neto, peso_bruto, valor_factura, moneda, incoterm, permiso_embarque.
          Devuelve solo el JSON estricto sin bloques de código markdown (\`\`\`json).`
        },
        {
          role: 'user',
          content: `Texto extraído de los documentos:\n${textoConsolidado}`
        }
      ]
    })

    const rawContent = response.choices[0]?.message?.content || '{}'
    
    // Limpieza de marcadores markdown en caso de que el modelo los incluya
    const cleanJsonString = rawContent.replace(/```json/g, '').replace(/```/g, '').trim()
    const extractedData = JSON.parse(cleanJsonString)

    return NextResponse.json({ success: true, data: extractedData })

  } catch (error: any) {
    console.error('Error en /api/analyze-crt:', error)
    return NextResponse.json(
      { error: error.message || 'Error interno al procesar los documentos.' },
      { status: 500 }
    )
  }
}