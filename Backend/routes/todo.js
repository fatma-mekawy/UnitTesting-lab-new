const express = require("express");
var router = express.Router();
var {
  getAllTodos,
  saveTodo,
  getTodoById,
  updateTitleTodoById,
  getUserTodos,
  deleteAllTodos,
} = require("../controllers/todo");
var auth = require("../middlewares/auth");

router
  .route("/")
  .get(getAllTodos)
  .post(auth, saveTodo)
  .delete(auth, deleteAllTodos);

router.patch("/:id", auth, updateTitleTodoById);

router.get("/user", auth, getUserTodos);

router.get("/:id", auth, getTodoById);

module.exports = router;
