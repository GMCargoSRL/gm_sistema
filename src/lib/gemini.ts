export async function analizarDocumentosCRT(archivosBase64: { nombre: string; mimeType: string; data: string }[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY en .env.local");

  const prompt = `
  Eres un experto en comercio exterior y logística transfronteriza (CRT / MIC-DTA).
  Se te proporcionan documentos de una carga (Factura de Exportación FCE, Packing List PL y Permiso de Embarque PE).
  
  Extrae la siguiente información consolidada para confeccionar la Carta de Porte Internacional (CRT):
  1. remitente: Nombre/Razón Social, CUIT, Dirección.
  2. destinatario: Nombre/Razón Social, RUC/TaxID, Dirección, País.
  3. consignatario: Nombre/Razón Social, RUC/TaxID, Dirección, País.
  4. datos_carga:
     - factura_numero
     - permiso_embarque
     - cantidad_bultos (ej: 28 PALLETS)
     - descripcion_mercaderia
     - peso_neto_kg
     - peso_bruto_kg
     - volumen_m3
     - valor_fob_fca (monto y moneda)
     - ncm_posicion_arancelaria

  Responde ÚNICAMENTE en formato JSON estricto con las claves exactas mencionadas.
  `;

  const contentsParts: any[] = [{ text: prompt }];

  archivosBase64.forEach(file => {
    contentsParts.push({
      inline_data: {
        mime_type: file.mimeType,
        data: file.data
      }
    });
  });

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: contentsParts }] })
  });

  const json = await response.json();
  const textResponse = json.candidates[0].content.parts[0].text;
  
  // Limpiar formato markdown ```json ``` si existe
  const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}