// IndexedDB-backed persistence (via localforage) + JSON export/import for backups.
import localforage from 'localforage';
import type { StateStorage } from 'zustand/middleware';

const store = localforage.createInstance({
  name: 'oscars-stora-bonanza',
  storeName: 'state',
  description: 'Sparad spelplan, spelare och inställningar',
});

/** Zustand persist adapter backed by IndexedDB (handles large base64 images fine). */
export const idbStorage: StateStorage = {
  getItem: async (name) => (await store.getItem<string>(name)) ?? null,
  setItem: async (name, value) => {
    await store.setItem(name, value);
  },
  removeItem: async (name) => {
    await store.removeItem(name);
  },
};

/** Trigger a download of the given data as a pretty-printed JSON file. */
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  // Safari ignores click() on a detached anchor, and revoking in the same tick can
  // cancel the in-flight download — so attach first and revoke later.
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Read a user-selected file and parse it as JSON. */
export function readJsonFile<T = unknown>(file: File): Promise<T> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)) as T);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
