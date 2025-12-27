import type { FastifyError, FastifyRequest, FastifyReply } from "fastify";

/**
 * Global error handler for Fastify
 * Handles 400 (validation) and 500 (server) errors
 */
export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log the error if logger is available
  if (request.log) {
    request.log.error(error);
  }

  // Handle validation errors (400) - from Fastify schema validation
  if (error.validation) {
    return reply.status(400).send({
      error: "Validation Error",
      message: error.message,
      details: error.validation,
    });
  }

  // Handle status code errors (like 400 from business logic)
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    return reply.status(error.statusCode).send({
      error: error.name || "Client Error",
      message: error.message || "A client error occurred",
    });
  }

  // Handle other errors (500)
  const statusCode = error.statusCode || 500;
  return reply.status(statusCode).send({
    error: error.name || "Internal Server Error",
    message: error.message || "An unexpected error occurred",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
}

