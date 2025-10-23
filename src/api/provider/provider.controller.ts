import type { Request, RequestHandler, Response } from "express";
import type { UpdateProvider } from "@/api/provider/provider.dto";
import { providerService } from "@/api/provider/provider.service";
import { baseFilter } from "@/types/express.types";

class ProviderController {
  // ✅ findProfile
  public findProfile: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await providerService.findProfile(req.account?.id!);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ updateProfile
  public updateProfile: RequestHandler = async (
    req: Request<{}, {}, UpdateProvider>,
    res: Response
  ) => {
    const serviceResponse = await providerService.updateProfile(
      req.account?.id!,
      req.body
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ toggle availability
  public toggleAvailability: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await providerService.toggleAvailability(
      req.account?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ get Providers
  public getProviders: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await providerService.findAll(
      _req.query as unknown as baseFilter
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ get Provider
  public getProvider: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await providerService.findOne(_req.params.id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅  delete my profile
  public deleteProvider: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await providerService.delete(_req.params.id);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅  delete my profile
  public deleteMyProviderProfile: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await providerService.delete(_req.account?.id!);
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Single provider
  public getMetric: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await providerService.getMetric(
      req.params?.id!
    );
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };

  // ✅ Multiple providers (admin)
  public getMetrics: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await providerService.getAllMetrics();
    res.status(serviceResponse.statusCode).send(serviceResponse);
  };
}

export const providerController = new ProviderController();
