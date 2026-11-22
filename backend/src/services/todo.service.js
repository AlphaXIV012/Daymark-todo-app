import * as todoRepository from "../repositories/todo.repository.js";

export async function getTodosForUser(userId) {
  return todoRepository.findAllForUser(userId);
}

export async function getTodoForUser(id, userId) {
  return todoRepository.findByIdForUser(id, userId);
}

export async function createTodo(task, userId) {
  return todoRepository.create({ userId, task: task.trim() });
}

export async function updateTodo(id, userId, updates) {
  const normalizedUpdates = {
    ...(updates.task !== undefined ? { task: updates.task.trim() } : {}),
    ...(updates.completed !== undefined ? { completed: updates.completed } : {}),
  };
  return todoRepository.updateForUser(id, userId, normalizedUpdates);
}

export async function deleteTodo(id, userId) {
  return todoRepository.deleteForUser(id, userId);
}

export async function getCompletedTodos(userId) {
  return todoRepository.findByCompletionForUser(userId, true);
}

export async function getActiveTodos(userId) {
  return todoRepository.findByCompletionForUser(userId, false);
}

export async function getAllTodosForAdmin() {
  return todoRepository.findAll();
}
