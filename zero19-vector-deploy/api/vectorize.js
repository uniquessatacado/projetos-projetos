const vtracer = require('@visioncortex/vtracer');
const zlib = require('zlib');

const MAX_SVG_BYTES = 80_000_000;

function clampDetail(value) {
  const n = Math.round(Number(value) || 5);
  return Math.min(5, Math.max(1, n));
}

function optionsFor(preset, detail) {
  const i = clampDetail(detail) - 1;

  if (preset === 'dtf') {
    return {
      preset: 'poster',
      clustering: 'color-cluster',
      hierarchical: 'stacked',
      mode: 'spline',
      filterSpeckle: 1,
      colorPrecision: 8,
      layerDifference: [10, 8, 6, 5, 4][i],
      cornerThreshold: 70,
      lengthThreshold: [4, 3, 2.5, 2, 1.5][i],
      maxIterations: [4, 5, 6, 7, 8][i],
      spliceThreshold: 45,
      pathPrecision: [3, 3, 4, 4, 5][i],
      maxColors: [128, 192, 256, 384, 512][i],
      optimize: 2,
    };
  }

  if (preset === 'photo') {
    return {
      preset: 'poster',
      clustering: 'color-cluster',
      hierarchical: 'stacked',
      mode: 'spline',
      filterSpeckle: [5, 4, 3, 2, 1][i],
      colorPrecision: 8,
      layerDifference: [14, 10, 8, 6, 5][i],
      cornerThreshold: 120,
      lengthThreshold: [4, 3, 2.5, 2, 1.5][i],
      maxIterations: [4, 5, 6, 7, 8][i],
      spliceThreshold: 45,
      pathPrecision: [3, 3, 4, 4, 5][i],
      maxColors: [128, 192, 256, 384, 512][i],
      optimize: 2,
    };
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
      optimize: 2,
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
      optimize: 2,
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

function trace(input, preset, detail) {
  const options = optionsFor(preset, detail);
  const svg = vtracer.convertBuffer(input, options);
  return {
    svg,
    bytes: Buffer.byteLength(svg, 'utf8'),
    paletteLimit: options.maxColors || null,
  };
}

function sendCompressedJson(res, payload) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Encoding', 'gzip');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Accept-Encoding');

  const gzip = zlib.createGzip({ level: 6 });
  gzip.on('error', (error) => {
    console.error('ZERO19 gzip error', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Falha ao compactar o SVG.' }));
    } else {
      res.destroy(error);
    }
  });
  gzip.pipe(res);
  gzip.end(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET' && String(req.query?.selftest || '') === '1') {
    try {
      const sample = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAR0lEQVR4nO3XMQoAMAhD0aT0/ldOj+AgJct3FnxkEHWSqFinORwAAACSdKcG26sB05qpJwAAAAAAAAAAGO+B329DPQEAAAA8OZcKPaU0KvwAAAAASUVORK5CYII=', 'base64');
      const result = trace(sample, 'dtf', 5);
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
    const result = trace(input, preset, detail);
    const elapsedMs = Date.now() - started;

    if (result.bytes > MAX_SVG_BYTES) {
      return res.status(413).json({
        error: 'O vetor ultrapassou 80 MB. Reduza um nível de detalhe ou use o PNG DTF Premium.',
      });
    }

    res.setHeader('X-Zero19-Svg-Bytes', String(result.bytes));
    res.setHeader('X-Zero19-Elapsed-Ms', String(elapsedMs));
    sendCompressedJson(res, {
      svg: result.svg,
      elapsedMs,
      bytes: result.bytes,
      paletteLimit: result.paletteLimit,
      quality: 'hd-gzip-stream',
    });
  } catch (error) {
    console.error('ZERO19 vectorize error', error);
    if (!res.headersSent) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Falha ao vetorizar a imagem.',
      });
    }
    res.destroy(error instanceof Error ? error : new Error(String(error)));
  }
};
