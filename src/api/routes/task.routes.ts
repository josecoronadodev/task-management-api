import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { create, getAll, getOne, update, remove } from "../../controllers/task.controller";

const router = Router();

router.use(authenticate);

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;