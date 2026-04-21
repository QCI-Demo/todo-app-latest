import { STORAGE_MODE, StorageMode } from "../config/appConfig";
import type { ITodoRepository } from "./ITodoRepository";
import { InMemoryTodoRepository } from "./InMemoryTodoRepository";
import { LocalStorageProxyRepository } from "./LocalStorageProxyRepository";

let inMemorySingleton: InMemoryTodoRepository | null = null;

export class RepositoryFactory {
  static getRepository(): ITodoRepository {
    if (STORAGE_MODE === StorageMode.LOCAL_PROXY) {
      return new LocalStorageProxyRepository();
    }
    if (!inMemorySingleton) {
      inMemorySingleton = new InMemoryTodoRepository();
    }
    return inMemorySingleton;
  }
}
