"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const prisma_1 = require("../lib/prisma");
const userSelect = {
    id: true,
    employeeCode: true,
    fullName: true,
    email: true,
    departmentId: true,
    status: true,
};
const mapUser = (user) => {
    return {
        id: user.id.toString(),
        employeeCode: user.employeeCode,
        fullName: user.fullName,
        email: user.email,
        departmentId: user.departmentId.toString(),
        status: user.status,
    };
};
const getUsers = async () => {
    const users = await prisma_1.prisma.user.findMany({
        orderBy: { id: "asc" },
        select: userSelect,
    });
    return users.map(mapUser);
};
exports.getUsers = getUsers;
const getUserById = async (id) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id },
        select: userSelect,
    });
    return user ? mapUser(user) : null;
};
exports.getUserById = getUserById;
const createUser = async (payload) => {
    const data = {
        employeeCode: payload.employeeCode,
        fullName: payload.fullName,
        email: payload.email,
        passwordHash: payload.passwordHash,
        departmentId: BigInt(payload.departmentId),
        status: payload.status ?? "ACTIVE",
    };
    const user = await prisma_1.prisma.user.create({
        data,
        select: userSelect,
    });
    return mapUser(user);
};
exports.createUser = createUser;
const updateUser = (id, payload) => {
    return prisma_1.prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({ where: { id } });
        if (!existingUser) {
            return null;
        }
        const data = {};
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
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const result = await prisma_1.prisma.user.deleteMany({
        where: { id },
    });
    return result.count > 0;
};
exports.deleteUser = deleteUser;
