import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Request logger middleware
 * Logs API requests for evaluation and debugging
 */
export async function logger(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  // Only log if logger is enabled
  if (!request.log) {
    return;
  }

  // Store start time in request object for response logging
  (request as any).startTime = Date.now();

  // Log request details
  request.log.info({
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers["user-agent"],
  });
}

/**
 * Response logger hook
 * Logs response time after request completes
 */
export async function responseLogger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.log) return;

  const startTime = (request as any).startTime;
  if (!startTime) return;

  const duration = Date.now() - startTime;
  request.log.info({
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    duration: `${duration}ms`,
  });
}
