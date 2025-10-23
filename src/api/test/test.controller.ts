import type { Request, RequestHandler, Response } from "express";
import { testService } from "@/api/test/test.service";
import { CreateTest, UpdateTest } from "./test.dto";

class TestController {
  create: RequestHandler = async (req: Request, res: Response) => {
    const data = req.body as CreateTest;
    const result = await testService.create(data);
    res.status(result.statusCode).json(result);
  };

  update: RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body as UpdateTest;
    const result = await testService.update(id, data);
    res.status(result.statusCode).json(result);
  };

  metrics: RequestHandler = async (req: Request, res: Response) => {
    const { provider_id } = req.query;
    const result = await testService.getMetrics(
      provider_id as string | undefined
    );
    res.status(result.statusCode).json(result);
  };
}

export const testController = new TestController();
