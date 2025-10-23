import { Request, Response, NextFunction } from "express";
import { prisma } from "@/prisma.client";
import { JwtHelper } from "@/common/utils/jwt";
import { logger } from "@/server";
import { StatusCodes } from "http-status-codes";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = JwtHelper.verifyAccessToken(token);

    if (!decoded?.sub) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Unauthorized" });
    }

    // Attach the account to the request
    const account = await prisma.account.findUnique({
      where: { id: decoded.sub },
    });

    if (!account) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Unauthorized" });
    }

    req.account = account; // ✅ Type-safe access in routes
    next();
  } catch (error) {
    logger.error(`Error registering account: ${(error as Error).message}`);
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "Unauthorized" });
  }
}


export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const account = req.account;

    if (!account) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(account.role)) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Forbidden: Insufficient role" });
    }

    next();
  };
}