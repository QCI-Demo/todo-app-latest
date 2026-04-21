export type StorageErrorCode = "NETWORK_ERROR" | "UPSTREAM_ERROR" | "NOT_FOUND";

export class StorageError extends Error {
  readonly code: StorageErrorCode;
  readonly statusCode?: number;

  constructor(
    message: string,
    code: StorageErrorCode,
    options?: { statusCode?: number; cause?: unknown }
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "StorageError";
    this.code = code;
    this.statusCode = options?.statusCode;
  }
}
