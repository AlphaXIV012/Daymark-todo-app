import * as todoService from "../services/todo.service.js";
import AppError from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function parseTodoId(req) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError("Todo ID must be a positive integer", 400);
  }
  return id;
}

export const getAllTodos = asyncHandler(async (req, res) => {
  const todos = await todoService.getTodosForUser(req.user.id);
  return res.status(200).json({ success: true, message: "Todos retrieved successfully", data: todos });
});

export const getTodoById = asyncHandler(async (req, res) => {
  const todo = await todoService.getTodoForUser(parseTodoId(req), req.user.id);
  if (!todo) throw new AppError("Todo not found", 404);
  return res.status(200).json({ success: true, message: "Todo retrieved successfully", data: todo });
});

export const createTodo = asyncHandler(async (req, res) => {
  const todo = await todoService.createTodo(req.body.task, req.user.id);
  return res.status(201).json({ success: true, message: "Todo created successfully", data: todo });
});

export const updateTodo = asyncHandler(async (req, res) => {
  const todo = await todoService.updateTodo(parseTodoId(req), req.user.id, req.body);
  if (!todo) throw new AppError("Todo not found", 404);
  return res.status(200).json({ success: true, message: "Todo updated successfully", data: todo });
});

export const deleteTodo = asyncHandler(async (req, res) => {
  const deleted = await todoService.deleteTodo(parseTodoId(req), req.user.id);
  if (!deleted) throw new AppError("Todo not found", 404);
  return res.status(200).json({ success: true, message: "Todo deleted successfully", data: null });
});

export const getCompletedTodos = asyncHandler(async (req, res) => {
  const todos = await todoService.getCompletedTodos(req.user.id);
  return res.status(200).json({ success: true, message: "Completed todos retrieved successfully", data: todos });
});

export const getActiveTodos = asyncHandler(async (req, res) => {
  const todos = await todoService.getActiveTodos(req.user.id);
  return res.status(200).json({ success: true, message: "Active todos retrieved successfully", data: todos });
});

export const getAllTodosForAdmin = asyncHandler(async (req, res) => {
  const todos = await todoService.getAllTodosForAdmin();
  return res.status(200).json({ success: true, message: "All todos retrieved successfully", data: todos });
});
