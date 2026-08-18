import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createAudit, getAuditById, listAudits } from "./db";
import { CRITERIA, evaluateAudit } from "./auditEngine";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  audits: router({
    list: protectedProcedure.query(({ ctx }) => listAudits(ctx.user.id)),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ ctx, input }) => getAuditById(input.id, ctx.user.id)),
    create: protectedProcedure.input(z.object({
      name: z.string().trim().min(2).max(160),
      description: z.string().trim().min(10).max(4000),
      code: z.string().min(1).max(500000),
      selectedCriteria: z.array(z.enum(CRITERIA)).min(1),
    })).mutation(async ({ ctx, input }) => {
      const report = evaluateAudit(input);
      const id = await createAudit({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        code: input.code,
        selectedCriteria: JSON.stringify(input.selectedCriteria),
        payloadHash: report.payloadHash,
        status: report.status,
        globalScore: report.globalScore,
        reportJson: JSON.stringify(report),
      });
      return { id, report };
    }),
    exportJson: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const audit = await getAuditById(input.id, ctx.user.id);
      if (!audit) return null;
      return JSON.parse(audit.reportJson);
    }),
  }),
});

export type AppRouter = typeof appRouter;
