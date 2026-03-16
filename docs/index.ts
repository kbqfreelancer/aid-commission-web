/**
 * openapi/index.ts
 *
 * OpenAPI 3.1 specification for the NHIDRS API.
 * Schemas are derived from Zod validators; paths are registered here.
 */

import { z } from 'zod';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from '@asteasolutions/zod-to-openapi';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  createOrganisationSchema,
  updateOrganisationSchema,
  organisationQuerySchema,
  createReportSchema,
  updateReportSchema,
  reportStatusSchema,
  reportQuerySchema,
  summaryQuerySchema,
  summaryByOrgQuerySchema,
  indicatorQuerySchema,
} from '../validators/index.js';

// ─── Shared response schemas ─────────────────────────────────────────────────

const successEnvelopeSchema = z
  .object({
    success: z.literal(true),
    data: z.unknown().optional(),
    meta: z
      .object({
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        pages: z.number(),
      })
      .optional(),
  })
  .openapi('SuccessEnvelope');

const errorEnvelopeSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
  })
  .openapi('ErrorEnvelope');

const objectIdParam = z.object({ id: z.string().openapi({ description: 'MongoDB ObjectId' }) });

// ─── Registry and security ───────────────────────────────────────────────────

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'JWT access token from /auth/login or /auth/refresh',
});

const secure = { security: [{ bearerAuth: [] }] };

// ─── Auth paths ───────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: { body: { content: { 'application/json': { schema: registerSchema } } } },
  responses: {
    201: {
      description: 'User created',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    409: {
      description: 'Email already registered',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
    422: {
      description: 'Validation failed',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: {
      description: 'Invalid credentials',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
    403: {
      description: 'Account deactivated',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
    422: {
      description: 'Validation failed',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/refresh',
  tags: ['Auth'],
  summary: 'Refresh access token',
  request: { body: { content: { 'application/json': { schema: refreshTokenSchema } } } },
  responses: {
    200: {
      description: 'New access token',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: {
      description: 'Invalid or expired refresh token',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
    422: {
      description: 'Validation failed',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  tags: ['Auth'],
  summary: 'Get current user',
  ...secure,
  responses: {
    200: {
      description: 'Current user',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
    404: {
      description: 'User not found',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
  },
});

// ─── Organisation paths ────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/api/v1/organisations',
  tags: ['Organisations'],
  summary: 'List organisations (paginated, filtered)',
  ...secure,
  request: { query: organisationQuerySchema },
  responses: {
    200: {
      description: 'Paginated list of organisations',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/organisations/{id}',
  tags: ['Organisations'],
  summary: 'Get organisation by ID',
  ...secure,
  request: { params: objectIdParam },
  responses: {
    200: {
      description: 'Organisation',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/organisations',
  tags: ['Organisations'],
  summary: 'Create organisation (admin only)',
  ...secure,
  request: { body: { content: { 'application/json': { schema: createOrganisationSchema } } } },
  responses: {
    201: {
      description: 'Organisation created',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    403: { description: 'Forbidden (admin required)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/organisations/{id}',
  tags: ['Organisations'],
  summary: 'Update organisation (admin only)',
  ...secure,
  request: {
    params: objectIdParam,
    body: { content: { 'application/json': { schema: updateOrganisationSchema } } },
  },
  responses: {
    200: {
      description: 'Organisation updated',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    403: { description: 'Forbidden (admin required)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/organisations/{id}',
  tags: ['Organisations'],
  summary: 'Deactivate organisation (admin only)',
  ...secure,
  request: { params: objectIdParam },
  responses: {
    200: {
      description: 'Organisation deactivated',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    403: { description: 'Forbidden (admin required)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

// ─── Report paths ─────────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/api/v1/reports',
  tags: ['Reports'],
  summary: 'List reports (paginated, filtered)',
  ...secure,
  request: { query: reportQuerySchema },
  responses: {
    200: {
      description: 'Paginated list of reports',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/reports',
  tags: ['Reports'],
  summary: 'Create report (draft)',
  ...secure,
  request: { body: { content: { 'application/json': { schema: createReportSchema } } } },
  responses: {
    201: {
      description: 'Report created',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/reports/summary/by-organisation',
  tags: ['Report summaries'],
  summary: 'Aggregated totals per organisation (paginated, filtered)',
  ...secure,
  request: { query: summaryByOrgQuerySchema },
  responses: {
    200: {
      description: 'Paginated summary by organisation',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/reports/summary/national',
  tags: ['Report summaries'],
  summary: 'National aggregate totals',
  ...secure,
  request: { query: summaryQuerySchema },
  responses: {
    200: {
      description: 'National summary',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/reports/{id}',
  tags: ['Reports'],
  summary: 'Get report by ID',
  ...secure,
  request: { params: objectIdParam },
  responses: {
    200: {
      description: 'Report',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/reports/{id}',
  tags: ['Reports'],
  summary: 'Update report (draft fields)',
  ...secure,
  request: {
    params: objectIdParam,
    body: { content: { 'application/json': { schema: updateReportSchema } } },
  },
  responses: {
    200: {
      description: 'Report updated',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/reports/{id}/status',
  tags: ['Reports'],
  summary: 'Update report status (workflow transition)',
  ...secure,
  request: {
    params: objectIdParam,
    body: { content: { 'application/json': { schema: reportStatusSchema } } },
  },
  responses: {
    200: {
      description: 'Status updated',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    400: {
      description: 'Invalid status transition',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    403: { description: 'Forbidden', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/reports/{id}',
  tags: ['Reports'],
  summary: 'Delete report',
  ...secure,
  request: { params: objectIdParam },
  responses: {
    200: {
      description: 'Report deleted',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

// ─── Indicator paths ─────────────────────────────────────────────────────────

registry.registerPath({
  method: 'get',
  path: '/api/v1/indicators',
  tags: ['Indicators'],
  summary: 'List indicator registry (paginated, filtered)',
  ...secure,
  request: { query: indicatorQuerySchema },
  responses: {
    200: {
      description: 'Paginated indicator definitions',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    404: { description: 'Indicator not found (when filtering by id)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/indicators/{id}',
  tags: ['Indicators'],
  summary: 'Get indicator definition by ID',
  ...secure,
  request: { params: z.object({ id: z.string().openapi({ description: 'Indicator ID' }) }) },
  responses: {
    200: {
      description: 'Indicator definition',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    404: { description: 'Not found', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

// ─── Admin config paths (admin role required) ─────────────────────────────────

const adminSecure = { security: [{ bearerAuth: [] }] };

registry.registerPath({
  method: 'get',
  path: '/api/v1/admin/config',
  tags: ['Admin config'],
  summary: 'Get all configuration (admin only)',
  ...adminSecure,
  responses: {
    200: { description: 'All config keys', content: { 'application/json': { schema: successEnvelopeSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    403: { description: 'Forbidden (admin required)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/admin/config/{key}',
  tags: ['Admin config'],
  summary: 'Get single config key (admin only)',
  ...adminSecure,
  request: { params: z.object({ key: z.string().openapi({ description: 'Config key' }) }) },
  responses: {
    200: { description: 'Config value', content: { 'application/json': { schema: successEnvelopeSchema } } },
    400: { description: 'Unknown key', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    403: { description: 'Forbidden (admin required)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/v1/admin/config/{key}',
  tags: ['Admin config'],
  summary: 'Update config key (admin only)',
  ...adminSecure,
  request: {
    params: z.object({ key: z.enum(['age-bands', 'sexes', 'violation-types', 'roles', 'quarters', 'report-statuses', 'status-transitions', 'required-current-status']) }),
    body: { content: { 'application/json': { schema: z.unknown().openapi({ description: 'Config value (array or object)' }) } } },
  },
  responses: {
    200: { description: 'Config updated', content: { 'application/json': { schema: successEnvelopeSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    403: { description: 'Forbidden (admin required)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/admin/config/indicators',
  tags: ['Admin config'],
  summary: 'List indicators (admin only, paginated, filtered)',
  ...adminSecure,
  request: { query: indicatorQuerySchema },
  responses: {
    200: { description: 'Paginated indicator list', content: { 'application/json': { schema: successEnvelopeSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    403: { description: 'Forbidden (admin required)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    404: { description: 'Indicator not found (when filtering by id)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    422: { description: 'Validation failed', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/admin/config/indicators',
  tags: ['Admin config'],
  summary: 'Create indicator (admin only)',
  ...adminSecure,
  request: { body: { content: { 'application/json': { schema: z.object({ id: z.string(), number: z.string(), label: z.string(), breakdowns: z.array(z.unknown()) }) } } } },
  responses: {
    201: { description: 'Indicator created', content: { 'application/json': { schema: successEnvelopeSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    403: { description: 'Forbidden (admin required)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

// ─── Audit trail (admin role required) ────────────────────────────────────────

const auditLogQuerySchema = z
  .object({
    entityType: z.string().optional().openapi({ description: 'Filter by entity type (e.g. HrReport, User)' }),
    entityId:   z.string().optional().openapi({ description: 'Filter by entity ID' }),
    actorId:    z.string().optional().openapi({ description: 'Filter by actor (user) ObjectId' }),
    action:     z.string().optional().openapi({ description: 'Filter by action (e.g. create, update, delete)' }),
    from:       z.string().optional().openapi({ description: 'Start of timestamp range (ISO 8601)' }),
    to:         z.string().optional().openapi({ description: 'End of timestamp range (ISO 8601)' }),
    page:       z.coerce.number().int().positive().default(1).openapi({ description: 'Page number' }),
    limit:      z.coerce.number().int().positive().max(100).default(50).openapi({ description: 'Items per page (max 100)' }),
  })
  .openapi('AuditLogQueryParams');

registry.registerPath({
  method: 'get',
  path: '/api/v1/admin/audit-logs',
  tags: ['Audit trail'],
  summary: 'List audit logs (admin only)',
  description: 'Append-only audit trail for compliance and forensics. Filter by entity, actor, action, or timestamp range.',
  ...adminSecure,
  request: { query: auditLogQuerySchema },
  responses: {
    200: {
      description: 'Paginated list of audit logs',
      content: { 'application/json': { schema: successEnvelopeSchema } },
    },
    400: {
      description: 'Invalid actorId format',
      content: { 'application/json': { schema: errorEnvelopeSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: errorEnvelopeSchema } } },
    403: { description: 'Forbidden (admin required)', content: { 'application/json': { schema: errorEnvelopeSchema } } },
  },
});

// ─── Generate spec ────────────────────────────────────────────────────────────

const generator = new OpenApiGeneratorV31(registry.definitions);

export const openApiDocument: OpenAPIObject = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'NHIDRS API',
    version: '1.0.0',
    description: 'National HIV & Human Rights Data Reporting System API',
  },
  servers: [{ url: '/', description: 'API server' }],
  tags: [
    { name: 'Auth', description: 'Authentication and session management' },
    { name: 'Organisations', description: 'Organisation CRUD and admin operations' },
    { name: 'Reports', description: 'Report lifecycle and CRUD' },
    { name: 'Report summaries', description: 'Aggregated totals by organisation or nationally' },
    { name: 'Indicators', description: 'Indicator registry definitions' },
    { name: 'Admin config', description: 'Admin-only configuration management' },
    { name: 'Audit trail', description: 'Admin-only audit log listing for compliance and forensics' },
  ],
});
