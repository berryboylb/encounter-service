import type { Request, RequestHandler, Response } from "express";
import {
  CreateEncounter,
  UpdateEncounter,
  Metrics,
  CancelEncounterDto,
  RescheduleEncounterDto,
} from "../encounter/encounter.dto";
import { encounterService } from "@/api/encounter/encounter.service";
import { baseFilter } from "@/types/express.types";

class EncounterController {
  // ✅ Create encounter
  public create: RequestHandler = async (
    req: Request<{}, {}, CreateEncounter>,
    res: Response
  ) => {
    const serviceResponse = await encounterService.create(
      req.body,
      req.account!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Update encounter
  public update: RequestHandler = async (
    req: Request<{ id?: string }, {}, UpdateEncounter>,
    res: Response
  ) => {
    const serviceResponse = await encounterService.update(
      req.params.id!,
      req.body,
      req.account?.role!,
      req.account?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Delete encounter
  public delete: RequestHandler = async (
    req: Request<{ id?: string }>,
    res: Response
  ) => {
    const serviceResponse = await encounterService.delete(
      req.params.id!,
      req.account?.role!,
      req.account?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Get all encounters
  public getEncounters: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await encounterService.findAll(
      req.query as unknown as baseFilter
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Get single encounter
  public getEncounter: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await encounterService.findOne(req.params.id!);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Start encounter
  public startEncounter: RequestHandler = async (
    req: Request<{ id?: string }>,
    res: Response
  ) => {
    const serviceResponse = await encounterService.startEncounter(
      req.params.id!,
      req.account?.role!,
      req.account?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Complete encounter
  public completeEncounter: RequestHandler = async (
    req: Request<{ id?: string }>,
    res: Response
  ) => {
    const serviceResponse = await encounterService.completeEncounter(
      req.params.id!,
      req.account?.role!,
      req.account?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Cancel encounter
  public cancelEncounter: RequestHandler = async (
    req: Request<{ id?: string }, {}, CancelEncounterDto>,
    res: Response
  ) => {
    const { reason } = req.body; // optional cancellation reason
    const serviceResponse = await encounterService.cancelEncounter(
      req.params.id!,
      req.account?.role!,
      req.account?.id!,
      reason // pass the reason to the service
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ reschedule encounter
  public rescheduleEncounter: RequestHandler = async (
    req: Request<{ id?: string }, {}, RescheduleEncounterDto>,
    res: Response
  ) => {
    const serviceResponse = await encounterService.rescheduleEncounter(
      req.params.id!,
      req.body,
      req.account?.role!,
      req.account?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Get encounter metrics
  public getMetrics: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await encounterService.getMetrics(
      req.query as unknown as Metrics
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const encounterController = new EncounterController();
