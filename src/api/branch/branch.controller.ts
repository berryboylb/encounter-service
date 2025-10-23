import type { Request, RequestHandler, Response } from "express";
import type { CreateBranch, UpdateBranch } from "@/api/branch/branch.dto";
import { branchService } from "@/api/branch/branch.service";
import { baseFilter } from "@/types/express.types";

class BranchController {
  // ✅ create branch
  public create: RequestHandler = async (
    req: Request<{}, {}, CreateBranch>,
    res: Response
  ) => {
    const serviceResponse = await branchService.create(
      req.account?.id!,
      req.body
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ create branch
  public update: RequestHandler = async (
    req: Request<{ id?: string }, {}, CreateBranch>,
    res: Response
  ) => {
    const serviceResponse = await branchService.update(
      req.params.id!,
      req.body,
      req.account?.role!,
      req.account?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ delete branch
  public delete: RequestHandler = async (
    req: Request<{ id?: string }, {}, CreateBranch>,
    res: Response
  ) => {
    const serviceResponse = await branchService.delete(
      req.params.id!,
      req.account?.role!,
      req.account?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ get branches
  public getBranches: RequestHandler = async (_req: Request, res: Response) => {
    console.log("query", _req.query);
    const serviceResponse = await branchService.findAll(
      _req.query as unknown as baseFilter
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ get branch
  public getBranch: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await branchService.findOne(_req.params.id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ toggle availability
  public toggleAvailability: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await branchService.toggleAvailability(
      req.account?.id!,
      req.account?.role!,
      req.account?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ providerBranchMetrics
  public getProviderBranchMetrics: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await branchService.metrics(req.params.provider_id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ metrics
  public getMetrics: RequestHandler = async (_: Request, res: Response) => {
    const serviceResponse = await branchService.metrics();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const branchController = new BranchController();
