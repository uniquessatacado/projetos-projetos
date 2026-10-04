const vtracer = require('@visioncortex/vtracer');

function clampDetail(value) {
  const n = Math.round(Number(value) || 4);
  return Math.min(5, Math.max(1, n));
}

function optionsFor(preset, detail) {
  const i = clampDetail(detail) - 1;
  const colorPrecision = [4, 5, 6, 7, 8][i];
  const filterSpeckle = [12, 8, 5, 3, 1][i];
  const layerDifference = [12, 9, 6, 3, 1][i];
  const lengthThreshold = [9, 7, 5, 3.5, 2][i];
  const maxIterations = [1, 1, 2, 2, 3][i];
  const pathPrecision = [2, 3, 4, 5, 6][i];
  const simplify = [2.8, 2.1, 1.5, 1.0, 0.6][i];

  if (preset === 'bw') {
    return {
      preset: 'bw',
      clustering: 'bw',
      hierarchical: 'cutout',
      mode: 'spline',
      filterSpeckle,
      lengthThreshold,
      maxIterations,
      pathPrecision,
      simplify,
      optimize: 2,
    };
  }

  if (preset === 'photo') {
    return {
      preset: 'photo',
      hierarchical: 'stacked',
      mode: 'spline',
      filterSpeckle,
      colorPrecision,
      layerDifference,
      lengthThreshold,
      maxIterations,
      pathPrecision,
      simplify,
      maxColors: [24, 32, 48, 64, 96][i],
      optimize: 2,
    };
  }

  if (preset === 'pixel') {
    return {
      preset: 'poster',
      hierarchical: 'cutout',
      mode: 'pixel',
      filterSpeckle: Math.min(3, filterSpeckle),
      colorPrecision,
      maxColors: [8, 12, 18, 28, 40][i],
      optimize: 2,
    };
  }

  return {
    preset: 'poster',
    hierarchical: 'cutout',
    mode: preset === 'logo' ? 'polygon' : 'spline',
    filterSpeckle: preset === 'dtf' ? Math.min(3, filterSpeckle) : filterSpeckle,
    colorPrecision: preset === 'dtf' ? Math.max(7, colorPrecision) : colorPrecision,
    layerDifference,
    cornerThreshold: preset === 'logo' ? 70 : 60,
    lengthThreshold,
    maxIterations,
    spliceThreshold: preset === 'logo' || preset === 'dtf' ? 55 : 45,
    pathPrecision,
    simplify,
    maxColors: preset === 'logo' ? [8, 12, 16, 24, 32][i] : [12, 16, 24, 32, 48][i],
    optimize: 2,
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST para vetorizar.' });
  }

  const started = Date.now();

  try {
    const input = await readBody(req);
    if (!input.length) return res.status(400).json({ error: 'Imagem vazia.' });
    if (input.length > 4_300_000) return res.status(413).json({ error: 'Imagem grande demais para processar. Reduza a resolução.' });

    const preset = String(req.headers['x-zero19-preset'] || 'dtf');
    const detail = req.headers['x-zero19-detail'] || '4';

    const svg = await Promise.resolve(vtracer.convertBuffer(input, optionsFor(preset, detail)));
    const bytes = Buffer.byteLength(svg, 'utf8');

    if (bytes > 4_100_000) {
      return res.status(413).json({ error: 'O vetor ficou complexo demais. Diminua o nível de detalhe e tente novamente.' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      svg,
      elapsedMs: Date.now() - started,
      bytes,
    });
  } catch (error) {
    console.error('ZERO19 vectorize error', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Falha ao vetorizar a imagem.',
    });
  }
};
