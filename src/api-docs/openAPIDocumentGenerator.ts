import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { accountRegistry } from "@/api/account/account.router";
import { healthCheckRegistry } from "@/api/healthCheck/healthCheckRouter";
import { authRegistry } from "@/api/auth/auth.routes";

export type OpenAPIDocument = ReturnType<
  OpenApiGeneratorV3["generateDocument"]
>;

export function generateOpenAPIDocument(): OpenAPIDocument {
  const registry = new OpenAPIRegistry([
    healthCheckRegistry,
    accountRegistry,
    authRegistry,
  ]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  const document = generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "Swagger API",
    },
    externalDocs: {
      description: "View the raw OpenAPI Specification in JSON format",
      url: "/swagger.json",
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  }) as any;

  // Add security schemes
  document.components = {
    ...document.components,
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Bearer token for authorization",
      },
    },
  };

  return document;
}
