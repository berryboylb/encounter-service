
import { commonValidations } from "@/common/utils/commonValidation";
import type { Account } from "@/generated/prisma";
import type { Request, RequestHandler, Response } from "express";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      account?: Account; // optional, will exist after auth middleware
    }
  }
}




export interface PaginatedOptions<T> {
  page?: number;
  pageSize?: number;
  search?: string;
  filterBy?: Partial<T>;
  orderBy?: keyof T | `-${string & keyof T}`; // prefix `-` for descending
  searchFields?: Array<keyof T>;
}

export type baseFilter = z.infer<typeof commonValidations.query>;
export type RequestWithQuery<Q> = Request<{}, any, any, Q>;

