const STORAGE_KEY = "ai-resume-analyzer:analyses";

const getPuterKV = () => {
  if (typeof window === "undefined") return null;
  return window.puter?.kv || null;
};

export const loadAnalyses = async () => {
  const kv = getPuterKV();
  if (kv?.get) {
    try {
      const payload = await kv.get(STORAGE_KEY);
      return payload ? JSON.parse(payload) : [];
    } catch {
      return [];
    }
  }
  const payload = localStorage.getItem(STORAGE_KEY);
  return payload ? JSON.parse(payload) : [];
};

export const saveAnalyses = async (analyses) => {
  const kv = getPuterKV();
  const payload = JSON.stringify(analyses);
  if (kv?.set) {
    await kv.set(STORAGE_KEY, payload);
    return;
  }
  localStorage.setItem(STORAGE_KEY, payload);
};

export const clearAnalyses = async () => {
  const kv = getPuterKV();
  if (kv?.remove) {
    await kv.remove(STORAGE_KEY);
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
};

export const addAnalysis = async (analysis) => {
  const analyses = await loadAnalyses();
  const updated = [analysis, ...analyses].slice(0, 50);
  await saveAnalyses(updated);
  return updated;
};

export const removeAnalysis = async (id) => {
  const analyses = await loadAnalyses();
  const updated = analyses.filter(a => a.id !== id);
  await saveAnalyses(updated);
  return updated;
};
