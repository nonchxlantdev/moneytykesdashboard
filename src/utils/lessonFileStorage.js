const DB_NAME = "moneytykes-lesson-files";
const DB_VERSION = 1;
const STORE_NAME = "files";

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Local file storage is not supported in this browser."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open local file storage."));
  });
}

function createFileId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `lesson-file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function runTransaction(mode, action) {
  return openDatabase().then(
    db =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        let request;

        try {
          request = action(store);
        } catch (error) {
          db.close();
          reject(error);
          return;
        }

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Local file operation failed."));
        transaction.oncomplete = () => db.close();
        transaction.onerror = () => {
          db.close();
          reject(transaction.error || new Error("Local file transaction failed."));
        };
      })
  );
}

/**
 * Store a lesson attachment locally for development/testing.
 * IndexedDB is intentionally isolated behind this adapter for a later Supabase swap.
 * Prefer `uploadLessonFileToSupabase` when VITE_USE_SUPABASE=true.
 */
export async function storeLessonFile(file) {
  const record = {
    id: createFileId(),
    blob: file,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    savedAt: new Date().toISOString()
  };

  await runTransaction("readwrite", store => store.put(record));
  return {
    fileId: record.id,
    fileName: record.name,
    fileMimeType: record.type,
    fileSize: record.size
  };
}

export function getLessonFile(fileId) {
  if (!fileId) return Promise.resolve(null);
  return runTransaction("readonly", store => store.get(fileId));
}

export function deleteLessonFile(fileId) {
  if (!fileId) return Promise.resolve();
  return runTransaction("readwrite", store => store.delete(fileId));
}

/**
 * Upload a lesson file to the private `lesson-files` Storage bucket.
 * Path: `{userId}/{fileId}-{safeName}`
 */
export async function uploadLessonFileToSupabase(file, userId) {
  const { requireSupabase } = await import("../lib/supabaseClient");
  const client = requireSupabase();
  const fileId = createFileId();
  const safeName = String(file.name || "file").replace(/[^\w.\-]+/g, "_");
  const path = `${userId}/${fileId}-${safeName}`;
  const { error } = await client.storage.from("lesson-files").upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });
  if (error) throw error;
  return {
    fileId: path,
    fileName: file.name,
    fileMimeType: file.type || "application/octet-stream",
    fileSize: file.size,
    storageBucket: "lesson-files"
  };
}

