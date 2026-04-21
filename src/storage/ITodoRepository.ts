import type { Todo } from "../models/todo";

export interface ITodoRepository {
  add(todo: Todo): Promise<Todo>;
  findAll(): Promise<Todo[]>;
  findById(id: string): Promise<Todo | undefined>;
  update(id: string, patch: Partial<Todo>): Promise<Todo | undefined>;
  remove(id: string): Promise<boolean>;
}
