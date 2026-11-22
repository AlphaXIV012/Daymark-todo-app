import { Router } from "express";
import * as todoController from "../controllers/todo.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { validateCreateTodo, validateUpdateTodo } from "../middleware/todoValidation.js";

const router = Router();

// All routes in this router require a valid access token.
router.use(authenticate);

// Put specific paths before /:id.
router.get("/admin/all", authorizeRoles("admin"), todoController.getAllTodosForAdmin);
router.get("/completed", todoController.getCompletedTodos);
router.get("/active", todoController.getActiveTodos);
router.get("/", todoController.getAllTodos);
router.get("/:id", todoController.getTodoById);
router.post("/", validateCreateTodo, todoController.createTodo);
router.patch("/:id", validateUpdateTodo, todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

export default router;
