import { env, pipeline } from '@xenova/transformers';

// Below env. config done by AI to fix some WASM issues in the browser
// TODO: check what's going on there
// Configure ONNX runtime for browsers without COOP/COEP
env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';
env.backends.onnx.wasm.proxy = false; // disable multithreaded worker proxy
env.backends.onnx.wasm.numThreads = 1; // single-thread to avoid cross-origin isolation requirements
env.allowLocalModels = false;
env.useBrowserCache = true; // enable Cache API/IndexedDB model caching

type EmbeddingPipeline = (
  text: string,
  options?: { pooling?: 'mean' | 'none'; normalize?: boolean }
) => Promise<{ data: Float32Array }>;

let embedder: EmbeddingPipeline | null = null;

// loads the embedding model once if needed (should be stored in IndexedDB)
export async function initEmbedder() {
  if (!embedder) {
    try {
      embedder = (await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      )) as unknown as EmbeddingPipeline;
      console.log('Embedder initialized (cached=', env.useBrowserCache, ')');
    } catch (error) {
      const message = (error as Error)?.message || String(error);
      // Common browser corruption: protobuf parsing failed due to partial/corrupted cached files
      if (
        /protobuf parsing failed/i.test(message) ||
        /Failed to load model/i.test(message) ||
        /can't create a session/i.test(message)
      ) {
        console.warn('Model load failed, clearing browser caches and retrying once...', message);
        await clearTransformersCaches();
        try {
          embedder = (await pipeline(
            'feature-extraction',
            'Xenova/all-MiniLM-L6-v2'
          )) as unknown as EmbeddingPipeline;
          console.log('Embedder initialized after cache clear');
        } catch (error2) {
          console.warn('Retry with cache failed; disabling browser cache and retrying...', error2);
          // As a last resort, disable cache for this session and retry once more
          const prev = env.useBrowserCache;
          env.useBrowserCache = false;
          try {
            embedder = (await pipeline(
              'feature-extraction',
              'Xenova/all-MiniLM-L6-v2'
            )) as unknown as EmbeddingPipeline;
            console.log('Embedder initialized with cache disabled');
          } finally {
            env.useBrowserCache = prev;
          }
        }
      } else {
        throw error;
      }
    }
  }
  return embedder;
}

/**
 * Get an embedding vector for a piece of text.
 * @param text The input text
 * @returns number[] embedding vector
 */
export async function getEmbedding(text: string): Promise<number[]> {
  if (!embedder) {
    await initEmbedder();
  }
  const output = await embedder!(text, {
    pooling: 'mean',
    normalize: true,
  });
  return Array.from(output.data);
}

/**
 * Cosine similarity between two embeddings
 * Returns normalized value in [0,1].
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const cosine = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return normalizeSemantic(cosine);
}

function normalizeSemantic(cosine: number, min = 0.5, max = 0.8) {
  // normalize cosine from [-1,1] → [0,1]
  const sim = (cosine + 1) / 2;
  // usually embedders witll return distance of around 0.5-0.8, rescale it to make result more discriminative
  const clipped = Math.max(min, Math.min(sim, max));
  return (clipped - min) / (max - min);
}

// Attempts to clear caches used by @xenova/transformers and ONNX Runtime Web.
async function clearTransformersCaches() {
  try {
    if (typeof caches !== 'undefined' && caches?.keys) {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => /transformers|xenova|onnx|ort/i.test(k)).map((k) => caches.delete(k))
      );
    }
  } catch (e) {
    console.warn('Failed clearing Cache API', e);
  }
  try {
    if (typeof indexedDB !== 'undefined') {
      // Known DB names used historically by transformers.js / ORT web
      const dbNames = ['transformers', 'transformers-cache', 'onnx', 'ort', 'ort-web'];
      await Promise.all(
        dbNames.map(
          (name) =>
            new Promise<void>((resolve) => {
              const req = indexedDB.deleteDatabase(name);
              req.onsuccess = () => resolve();
              req.onerror = () => resolve();
              req.onblocked = () => resolve();
            })
        )
      );
    }
  } catch (e) {
    console.warn('Failed clearing IndexedDB caches', e);
  }
}
