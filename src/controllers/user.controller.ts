import { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import {
  createUser,
  CreateUserPayload,
  deleteUser,
  getUserById,
  getUsers,
  UpdateUserPayload,
  updateUser,
} from "../services/user.service";

const parseId = (value: string | string[] | undefined): bigint | null => {
  if (typeof value !== "string") {
    return null;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  return BigInt(value);
};

const handleServiceError = (error: unknown, res: Response) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Duplicate employeeCode or email" });
    }

    if (error.code === "P2003") {
      return res.status(400).json({ message: "Invalid departmentId" });
    }
  }

  return res.status(500).json({ message: "Internal server error" });
};

export const getUsersController = async (_req: Request, res: Response) => {
  try {
    const users = await getUsers();
    return res.json({
      message: "Users retrieved successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    return handleServiceError(error, res);
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  const userId = parseId(req.params.id);

  if (userId === null) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  try {
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    return handleServiceError(error, res);
  }
};

export const createUserController = async (req: Request, res: Response) => {
  const { employeeCode, fullName, email, status } =
    req.body as Partial<CreateUserPayload>;
  const passwordHash = (req.body as Partial<CreateUserPayload>).passwordHash;
  const departmentId = (req.body as Partial<CreateUserPayload>).departmentId;

  if (!employeeCode || !fullName || !email || !passwordHash || !departmentId) {
    return res.status(400).json({
      message:
        "employeeCode, fullName, email, passwordHash and departmentId are required",
    });
  }

  if (!/^\d+$/.test(departmentId)) {
    return res.status(400).json({ message: "Invalid departmentId" });
  }

  try {
    const newUser = await createUser({
      employeeCode,
      fullName,
      email,
      passwordHash,
      departmentId,
      status,
    });

    return res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    return handleServiceError(error, res);
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  const userId = parseId(req.params.id);

  if (userId === null) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  const payload = req.body as UpdateUserPayload;

  if (
    payload.departmentId !== undefined &&
    !/^\d+$/.test(payload.departmentId)
  ) {
    return res.status(400).json({ message: "Invalid departmentId" });
  }

  try {
    const user = await updateUser(userId, payload);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    return handleServiceError(error, res);
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  const userId = parseId(req.params.id);

  if (userId === null) {
    return res.status(400).json({ message: "Invalid user id" });
  }

  try {
    const deleted = await deleteUser(userId);

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return handleServiceError(error, res);
  }
};
