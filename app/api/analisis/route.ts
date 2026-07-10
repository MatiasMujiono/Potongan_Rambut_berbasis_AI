// app/api/analisis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface AnalisisRequest {
  image: string;
  instruction?: string;
}

const GEMINI_MODEL = 'gemini-2.0-flash';

function getGeminiErrorInfo(error: unknown): {
  isQuotaError: boolean;
  isTransient: boolean;
  status: number;
  message: string;
} {
  const err = error as any;
  const httpStatus: number = err?.status ?? err?.error?.code ?? err?.response?.status ?? 0;
  const rawMessage: string = typeof err?.message === 'string' ? err.message : JSON.stringify(err?.error ?? err ?? 'Unknown error');

  const isQuotaError = httpStatus === 429 || rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('quota');
  const isTransient = httpStatus === 503 || httpStatus === 504 || rawMessage.includes('UNAVAILABLE') || rawMessage.includes('overloaded');

  return { isQuotaError, isTransient, status: httpStatus || 500, message: rawMessage };
}

async function generateWithRetry(ai: GoogleGenAI, params: Parameters<GoogleGenAI['models']['generateContent']>[0], maxRetries = 2) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error) {
      lastError = error;
      const info = getGeminiErrorInfo(error);
      if (info.isQuotaError) throw error;
      if (info.isTransient && attempt < maxRetries) {
        const delayMs = 1000 * (attempt + 1);
        console.warn(`Gemini transient error (percobaan ${attempt + 1}/${maxRetries + 1}), retry dalam ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  console.log('=== API Analisis + Generate Gambar (via Replicate) ===');

  try {
    const body: AnalisisRequest = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Foto tidak ditemukan. Silakan ambil foto terlebih dahulu.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY tidak diset di environment variables');
      return NextResponse.json(
        { success: false, error: 'Konfigurasi server belum lengkap (API key tidak ditemukan).', code: 'CONFIG_ERROR' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // 1. ANALISIS WAJAH dengan Gemini
    const prompt = `Anda adalah ahli fashion dan penata rambut profesional.
Tugas: Analisis foto wajah ini (bentuk wajah, jenis rambut, gaya), lalu berikan 3 rekomendasi potongan rambut yang cocok.

**FORMAT RESPONSE (WAJIB JSON):**
{
  "rekomendasi": "Nama potongan rambut utama",
  "deskripsi": "Deskripsi detail mengapa potongan ini cocok",
  "gayaRambut": ["Gaya 1", "Gaya 2", "Gaya 3"],
  "confidence": 0.95,
  "tipsPerawatan": "Tips perawatan singkat"
}
Hanya output JSON, tidak ada teks lain.`;

    let textResult: string | undefined;
    try {
      const result = await generateWithRetry(ai, {
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            ],
          },
        ],
        config: { temperature: 0.7, maxOutputTokens: 1024 },
      });
      textResult = result.text;
    } catch (error) {
      console.error('Gemini analysis error:', error);
      const info = getGeminiErrorInfo(error);
      if (info.isQuotaError) {
        return NextResponse.json({ success: false, error: 'Kuota API Gemini sudah habis.', code: 'QUOTA_EXCEEDED' }, { status: 429 });
      }
      if (info.isTransient) {
        return NextResponse.json({ success: false, error: 'Server Gemini sedang sibuk/overload.', code: 'SERVER_BUSY' }, { status: 503 });
      }
      return NextResponse.json({ success: false, error: 'Gagal menganalisis wajah.', code: 'ANALYSIS_FAILED' }, { status: 502 });
    }

    if (!textResult) {
      return NextResponse.json({ success: false, error: 'Tidak ada respons dari Gemini.', code: 'EMPTY_RESPONSE' }, { status: 502 });
    }

    // Parse JSON
    let parsedData = {
      rekomendasi: 'Classic Bob',
      deskripsi: 'Potongan bob klasik sangat cocok untuk berbagai bentuk wajah.',
      gayaRambut: ['Layer Cut', 'Pixie Style', 'Long Bob'],
      confidence: 0.85,
      tipsPerawatan: 'Rutin trim setiap 4-6 minggu.',
    };
    try {
      const jsonMatch = textResult.match(/\{[\s\S]*\}/);
      const raw = jsonMatch ? jsonMatch[0] : textResult;
      const parsed = JSON.parse(raw);
      parsedData = { ...parsedData, ...parsed };
    } catch (e) {
      console.warn('Gagal parse JSON dari Gemini, menggunakan data fallback:', e);
    }

    // 2. GENERATE GAMBAR dengan Replicate
    let generatedImageBase64: string | null = null;
    const replicateKey = process.env.REPLICATE_API_KEY;

    if (replicateKey) {
      try {
        console.log('Memulai generate gambar dengan Replicate...');
        const imagePrompt = `Professional hairstyle: ${parsedData.rekomendasi} on a person with similar face shape, photorealistic, studio lighting, high quality, 4k, detailed hair texture.`;

        const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${replicateKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
            input: {
              prompt: imagePrompt,
              negative_prompt: 'blurry, ugly, low quality, distorted face',
              width: 512,
              height: 512,
              num_outputs: 1,
            },
          }),
        });

        if (!replicateResponse.ok) {
          const errText = await replicateResponse.text().catch(() => '');
          throw new Error(`Replicate API error: ${replicateResponse.status} ${errText}`);
        }

        const prediction = await replicateResponse.json();
        const pollUrl = prediction.urls?.get;

        if (pollUrl) {
          let imageUrl: string | null = null;
          for (let i = 0; i < 30; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const statusRes = await fetch(pollUrl, {
              headers: { Authorization: `Token ${replicateKey}` },
            });
            const statusData = await statusRes.json();
            
            if (statusData.status === 'succeeded') {
              imageUrl = statusData.output?.[0] ?? null;
              break;
            } else if (statusData.status === 'failed' || statusData.status === 'canceled') {
              throw new Error(`Replicate generation ${statusData.status}`);
            }
          }

          if (imageUrl) {
            const imgRes = await fetch(imageUrl);
            const buffer = await imgRes.arrayBuffer();
            // Buffer.from compatible format for Edge/Node
            const base64 = Buffer.from(buffer).toString('base64');
            generatedImageBase64 = `data:image/jpeg;base64,${base64}`;
            console.log('✅ Gambar berhasil di-generate dari Replicate!');
          } else {
            console.warn('⚠️ Replicate: polling selesai tanpa hasil gambar (kemungkinan timeout).');
          }
        }
      } catch (error) {
        console.error('Replicate generation error:', error);
      }
    } else {
      console.log('ℹ️ REPLICATE_API_KEY tidak diset, lewati generate gambar.');
    }

    return NextResponse.json({
      success: true,
      data: {
        ...parsedData,
        capturedImage: image, 
        generatedImage: generatedImageBase64, 
      },
      hasGeneratedImage: !!generatedImageBase64,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}