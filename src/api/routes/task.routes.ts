import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { create, getAll, getOne, update, remove } from "../../controllers/task.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.schema";

const router = Router();

router.use(authenticate);

router.post("/", validateBody(createTaskSchema), create);
router.get("/", getAll);
router.get("/:id", getOne);
router.put("/:id", validateBody(updateTaskSchema), update);
router.delete("/:id", remove);

export default router;