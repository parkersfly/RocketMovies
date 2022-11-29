const { Router } = require("express");

const usersRoutes = Router();

const UsersController = require("../controllers/usersController");

const usersController = new UsersController();

usersRoutes.post("/", usersController.create);
usersRoutes.put("/:id", usersController.update);
usersRoutes.delete("/:id", usersController.delete);

module.exports = usersRoutes;