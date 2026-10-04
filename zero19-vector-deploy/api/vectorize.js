const vtracer = require('@visioncortex/vtracer');

const MAX_SVG_BYTES = 3_850_000;

function clampDetail(value) {
  const n = Math.round(Number(value) || 5);
  return Math.min(5, Math.max(1, n));
}

function optionsFor(preset, detail, maxColors) {
  const i = clampDetail(detail) - 1;

  if (preset === 'dtf') {
    // DTF = fidelidade máxima. Não simplifica curvas e preserva o máximo de
    // variações de cor possível. O limite de cores só é aplicado como fallback
    // quando o SVG excederia o limite de resposta da Vercel.
    const options = {
      preset: 'poster',
      clustering: 'color-cluster',
      hierarchical: 'stacked',
      mode: 'spline',
      filterSpeckle: 1,
      colorPrecision: 8,
      layerDifference: 1,
      cornerThreshold: 60,
      lengthThreshold: 1,
      maxIterations: 12,
      spliceThreshold: 45,
      pathPrecision: 5,
      optimize: 1,
    };
    if (maxColors) options.maxColors = maxColors;
    return options;
  }

  if (preset === 'photo') {
    const options = {
      preset: 'poster',
      clustering: 'color-cluster',
      hierarchical: 'stacked',
      mode: 'spline',
      filterSpeckle: [4, 3, 2, 1, 1][i],
      colorPrecision: 8,
      layerDifference: [8, 6, 4, 2, 1][i],
      cornerThreshold: 120,
      lengthThreshold: [3, 2.5, 2, 1.5, 1][i],
      maxIterations: [6, 7, 8, 10, 12][i],
      spliceThreshold: 45,
      pathPrecision: [3, 3, 4, 4, 5][i],
      optimize: 1,
    };
    if (maxColors) options.maxColors = maxColors;
    return options;
  }

  if (preset === 'bw') {
    return {
      preset: 'bw',
      clustering: 'bw',
      hierarchical: 'cutout',
      mode: 'spline',
      filterSpeckle: [10, 7, 4, 2, 1][i],
      lengthThreshold: [7, 5, 3, 2, 1][i],
      maxIterations: [3, 4, 6, 8, 10][i],
      pathPrecision: [2, 3, 3, 4, 4][i],
      optimize: 1,
    };
  }

  if (preset === 'pixel') {
    return {
      preset: 'poster',
      hierarchical: 'cutout',
      mode: 'pixel',
      filterSpeckle: 1,
      colorPrecision: 8,
      maxColors: [16, 24, 32, 48, 64][i],
      optimize: 1,
    };
  }

  return {
    preset: 'poster',
    clustering: 'color-cluster',
    hierarchical: 'cutout',
    mode: 'spline',
    filterSpeckle: [6, 4, 3, 2, 1][i],
    colorPrecision: 8,
    layerDifference: [10, 8, 6, 4, 2][i],
    cornerThreshold: 65,
    lengthThreshold: [6, 4, 3, 2, 1.5][i],
    maxIterations: [4, 5, 6, 8, 10][i],
    spliceThreshold: 50,
    pathPrecision: [2, 3, 3, 4, 4][i],
    maxColors: [24, 32, 48, 64, 96][i],
    optimize: 1,
  };
}

async function readBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (req.body instanceof Uint8Array) return Buffer.from(req.body);
  if (typeof req.body === 'string') return Buffer.from(req.body, 'binary');
  if (req.body && Array.isArray(req.body.data)) return Buffer.from(req.body.data);

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function traceWithFidelity(input, preset, detail) {
  const fidelityPreset = preset === 'dtf' || preset === 'photo';

  if (!fidelityPreset) {
    const svg = vtracer.convertBuffer(input, optionsFor(preset, detail));
    return {
      svg,
      bytes: Buffer.byteLength(svg, 'utf8'),
      paletteLimit: null,
    };
  }

  // Primeiro tenta sem reduzir a paleta. Só reduz se o SVG não couber com
  // segurança na resposta da Vercel.
  const attempts = [null, 512, 384, 256, 192, 128];
  let last = null;

  for (const maxColors of attempts) {
    const svg = vtracer.convertBuffer(input, optionsFor(preset, detail, maxColors));
    const bytes = Buffer.byteLength(svg, 'utf8');
    last = { svg, bytes, paletteLimit: maxColors };

    if (bytes <= MAX_SVG_BYTES) return last;
  }

  return last;
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET' && String(req.query?.selftest || '') === '1') {
    try {
      const sample = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAR0lEQVR4nO3XMQoAMAhD0aT0/ldOj+AgJct3FnxkEHWSqFinORwAAACSdKcG26sB05qpJwAAAAAAAAAAGO+B329DPQEAAAA8OZcKPaU0KvwAAAAASUVORK5CYII=', 'base64');
      const result = traceWithFidelity(sample, 'dtf', 5);
      return res.status(200).json({
        ok: typeof result.svg === 'string' && result.svg.includes('<svg'),
        bytes: result.bytes,
        paletteLimit: result.paletteLimit,
      });
    } catch (error) {
      return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST para vetorizar.' });
  }

  const started = Date.now();

  try {
    const input = await readBody(req);
    if (!input.length) return res.status(400).json({ error: 'Imagem vazia.' });
    if (input.length > 4_300_000) {
      return res.status(413).json({ error: 'Imagem grande demais para processar. Reduza a resolução.' });
    }

    const preset = String(req.headers['x-zero19-preset'] || 'dtf');
    const detail = req.headers['x-zero19-detail'] || '5';

    const result = traceWithFidelity(input, preset, detail);

    if (!result || result.bytes > MAX_SVG_BYTES) {
      return res.status(413).json({
        error: 'Essa arte gerou um vetor extremamente complexo. Para impressão perfeita, use o PNG DTF 300 DPI; para SVG, tente uma imagem mais simples.',
      });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      svg: result.svg,
      elapsedMs: Date.now() - started,
      bytes: result.bytes,
      paletteLimit: result.paletteLimit,
      quality: result.paletteLimit ? 'fallback' : 'maximum',
    });
  } catch (error) {
    console.error('ZERO19 vectorize error', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Falha ao vetorizar a imagem.',
    });
  }
};
