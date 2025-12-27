import type { FastifyRequest, FastifyReply } from "fastify";

/**
 * Request logger middleware
 * Logs API requests for evaluation and debugging
 */
export async function logger(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Only log if logger is enabled
  if (!request.log) {
    return;
  }

  const startTime = Date.now();

  // Log request details
  request.log.info({
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers["user-agent"],
  });

  // Log response time after request completes
  reply.addHook("onSend", async (request, reply) => {
    if (!request.log) return;
    const duration = Date.now() - startTime;
    request.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
    });
  });
}

