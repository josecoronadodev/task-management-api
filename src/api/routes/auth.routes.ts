import { Router } from "express";
import { register, login } from "../../controllers/auth.controller";
import { validateBody } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: "Jose" }
 *               email: { type: string, example: "jose@test.com" }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       201: { description: User created successfully }
 *       400: { description: Validation error }
 *       409: { description: Email already registered }
 */
router.post("/register", validateBody(registerSchema), register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "jose@test.com" }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       200: { description: Login successful, returns a JWT }
 *       401: { description: Invalid credentials }
 */
router.post("/login", validateBody(loginSchema), login);

export default router;