type StorageLike = Pick<Storage, "getItem" | "key" | "length" | "removeItem" | "setItem">;

const legacyPrefix = "markdownloom:";
const currentPrefix = "tickpad:";

export function migrateLegacyStorage(storage: StorageLike) {
  const legacyKeys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
    (key): key is string => key?.startsWith(legacyPrefix) === true
  );

  for (const legacyKey of legacyKeys) {
    const currentKey = `${currentPrefix}${legacyKey.slice(legacyPrefix.length)}`;
    const legacyValue = storage.getItem(legacyKey);
    if (storage.getItem(currentKey) === null && legacyValue !== null) {
      storage.setItem(currentKey, legacyValue);
    }
    storage.removeItem(legacyKey);
  }
}
