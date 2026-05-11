import { Prisma, UserStatus } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

export interface UserItem {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  departmentId: string;
  status: UserStatus;
  department: {
    id: string;
    code: string;
    name: string;
  };
}

export interface CreateUserPayload {
  employeeCode: string;
  fullName: string;
  email: string;
  passwordHash: string;
  departmentId: string;
  status?: UserStatus;
}

export interface UpdateUserPayload {
  employeeCode?: string;
  fullName?: string;
  email?: string;
  passwordHash?: string;
  departmentId?: string;
  status?: UserStatus;
}

const userSelect = {
  id: true,
  employeeCode: true,
  fullName: true,
  email: true,
  departmentId: true,
  status: true,
  department: {
    select: {
      id: true,
      departmentCode: true,
      departmentName: true,
    },
  },
} as const;

type UserRecord = Prisma.UserGetPayload<{ select: typeof userSelect }>;

const mapUser = (user: UserRecord): UserItem => {
  return {
    id: user.id.toString(),
    employeeCode: user.employeeCode,
    fullName: user.fullName,
    email: user.email,
    departmentId: user.departmentId.toString(),
    department: {
      id: user.department.id.toString(),
      code: user.department.departmentCode,
      name: user.department.departmentName,
    },
    status: user.status,
  };
};

export const getUsers = async (): Promise<UserItem[]> => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    select: userSelect,
  });

  return users.map(mapUser);
};

export const getUserById = async (id: bigint): Promise<UserItem | null> => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  return user ? mapUser(user) : null;
};

export const createUser = async (
  payload: CreateUserPayload,
): Promise<UserItem> => {
  const data: Prisma.UserUncheckedCreateInput = {
    employeeCode: payload.employeeCode,
    fullName: payload.fullName,
    email: payload.email,
    passwordHash: payload.passwordHash,
    departmentId: BigInt(payload.departmentId),
    status: payload.status ?? "ACTIVE",
  };

  const user = await prisma.user.create({
    data,
    select: userSelect,
  });

  return mapUser(user);
};

export const updateUser = (
  id: bigint,
  payload: UpdateUserPayload,
): Promise<UserItem | null> => {
  return prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({ where: { id } });

    if (!existingUser) {
      return null;
    }

    const data: Prisma.UserUncheckedUpdateInput = {};

    if (payload.employeeCode !== undefined) {
      data.employeeCode = payload.employeeCode;
    }

    if (payload.fullName !== undefined) {
      data.fullName = payload.fullName;
    }

    if (payload.email !== undefined) {
      data.email = payload.email;
    }

    if (payload.passwordHash !== undefined) {
      data.passwordHash = payload.passwordHash;
    }

    if (payload.departmentId !== undefined) {
      data.departmentId = BigInt(payload.departmentId);
    }

    if (payload.status !== undefined) {
      data.status = payload.status;
    }

    const updatedUser = await tx.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    return mapUser(updatedUser);
  });
};

export const deleteUser = async (id: bigint): Promise<boolean> => {
  const result = await prisma.user.deleteMany({
    where: { id },
  });

  return result.count > 0;
};
