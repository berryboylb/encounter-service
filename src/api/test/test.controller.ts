import type { Request, RequestHandler, Response } from "express";
import { testService } from "@/api/test/test.service";
import type { CreateTest, UpdateTest, TestMetrics } from "./test.dto";
import type { baseFilter } from "@/types/express.types";

class TestController {
	// ✅ Create test
	create: RequestHandler = async (req: Request<{}, {}, CreateTest>, res: Response) => {
		const result = await testService.create(req.body);
		res.status(result.statusCode).json(result);
	};

	// ✅ Update test
	update: RequestHandler = async (req: Request<{ id?: string }, {}, UpdateTest>, res: Response) => {
		const result = await testService.update(req.params.id!, req.body, req.account!);
		res.status(result.statusCode).json(result);
	};

	// ✅ Get test metrics
	metrics: RequestHandler = async (req: Request, res: Response) => {
		const result = await testService.getMetrics(req.query as unknown as TestMetrics);
		res.status(result.statusCode).json(result);
	};

	// ✅ Get all tests
	getTests: RequestHandler = async (req: Request, res: Response) => {
		const result = await testService.findAll(req.query as unknown as baseFilter);
		res.status(result.statusCode).json(result);
	};

	// ✅ Get single test
	getTest: RequestHandler = async (req: Request, res: Response) => {
		const result = await testService.findOne(req.params.id!);
		res.status(result.statusCode).json(result);
	};

	// ✅ Approve test
	approve: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const result = await testService.approve(id);
		res.status(result.statusCode).json(result);
	};

	// ✅ Reject test
	reject: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const result = await testService.reject(id);
		res.status(result.statusCode).json(result);
	};
	// ✅ Delete test
	delete: RequestHandler = async (req: Request, res: Response) => {
		const { id } = req.params;
		const { role, id: account_id } = req.account!;

		const result = await testService.delete(id, role, account_id);
		res.status(result.statusCode).json(result);
	};
}

export const testController = new TestController();
