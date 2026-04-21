export enum StorageMode {
  IN_MEMORY = "IN_MEMORY",
  LOCAL_PROXY = "LOCAL_PROXY",
}

export const STORAGE_MODE: StorageMode =
  process.env.STORAGE_MODE?.toUpperCase() === "LOCAL_PROXY"
    ? StorageMode.LOCAL_PROXY
    : StorageMode.IN_MEMORY;
