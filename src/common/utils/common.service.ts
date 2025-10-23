// src/repositories/base.repository.ts
import { PrismaClient } from "@/generated/prisma";

import { prisma } from "@/prisma.client";

// A helper type to infer the argument types of model delegate methods
type DelegateMethodArgs<T, K extends keyof T> = T[K] extends (args: infer A) => any ? A : never;
type DelegateReturnType<T, K extends keyof T> = T[K] extends (...args: any[]) => Promise<infer R>
  ? R
  : never;

export abstract class BaseRepository<
  ModelDelegate extends {
    findUnique: (...args: any[]) => any;
    findMany: (...args: any[]) => any;
    create: (...args: any[]) => any;
    update: (...args: any[]) => any;
    delete: (...args: any[]) => any;
    findFirst: (...args: any[]) => any;
    upsert: (...args: any[]) => any;
    count: (...args: any[]) => any;
    aggregate: (...args: any[]) => any;
  }
> {
  protected readonly prisma: PrismaClient;
  protected readonly model: ModelDelegate;

  constructor(prisma: PrismaClient, model: ModelDelegate) {
    this.prisma = prisma;
    this.model = model;
  }

  async findById(
    id: string | number
  ): Promise<DelegateReturnType<ModelDelegate, "findUnique"> | null> {
    return this.model.findUnique({ where: { id } } as DelegateMethodArgs<
      ModelDelegate,
      "findUnique"
    >);
  }

  async findAll(
    options?: DelegateMethodArgs<ModelDelegate, "findMany">
  ): Promise<DelegateReturnType<ModelDelegate, "findMany">> {
    return this.model.findMany(options);
  }

  async create(
    data: DelegateMethodArgs<ModelDelegate, "create">
  ): Promise<DelegateReturnType<ModelDelegate, "create">> {
    return this.model.create(data);
  }

  async update(
    data: DelegateMethodArgs<ModelDelegate, "update">
  ): Promise<DelegateReturnType<ModelDelegate, "update">> {
    return this.model.update(data);
  }

  async delete(
    data: DelegateMethodArgs<ModelDelegate, "delete">
  ): Promise<DelegateReturnType<ModelDelegate, "delete">> {
    return this.model.delete(data);
  }

  async findOne(
    options: DelegateMethodArgs<ModelDelegate, "findFirst">
  ): Promise<DelegateReturnType<ModelDelegate, "findFirst">> {
    return this.model.findFirst(options);
  }

  async upsert(
    options: DelegateMethodArgs<ModelDelegate, "upsert">
  ): Promise<DelegateReturnType<ModelDelegate, "upsert">> {
    return this.model.upsert(options);
  }

  async count(
    options: DelegateMethodArgs<ModelDelegate, "count">
  ): Promise<DelegateReturnType<ModelDelegate, "count">> {
    return this.model.count(options);
  }

  async aggregate(
    options: DelegateMethodArgs<ModelDelegate, "aggregate">
  ): Promise<DelegateReturnType<ModelDelegate, "aggregate">> {
    return this.model.aggregate(options);
  }


  async findPaginated<T extends Record<string, any>>(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    filterBy?: Partial<T>;
    orderBy?: string; // e.g., "-created_at" or "name"
    searchFields?: Array<keyof T>;
  }): Promise<{
    data: DelegateReturnType<ModelDelegate, "findMany">;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      pageSize = 10,
      search,
      filterBy = {},
      orderBy,
      searchFields = [],
    } = options;

    const where: any = { ...filterBy };

    // Add search condition if provided
    if (search && searchFields.length > 0) {
      where.OR = searchFields.map((field) => ({
        [field]: { contains: search, mode: "insensitive" },
      }));
    }

    // Handle orderBy string
    let order: any = undefined;
    if (orderBy) {
      const isDesc = orderBy.startsWith("-");
      const field = isDesc ? orderBy.slice(1) : orderBy;
      order = { [field]: isDesc ? "desc" : "asc" };
    }

    const total = await (this.model as any).count({ where });
    const data = await this.model.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: order,
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
