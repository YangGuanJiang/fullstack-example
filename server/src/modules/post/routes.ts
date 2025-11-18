import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../../middlewares/auth";
const prisma = new PrismaClient();
const r = Router();

r.get("/", async (req, res, next) => {
    try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: true, comments: true, likes: true }
    });
    res.json(posts);
  } catch (e) { next(e); }
})

r.post("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({
      content: z.string().min(1),
      imageUrl: z.string().url().optional()
    }).parse(req.body);

    const post = await prisma.post.create({
      data: { ...data, authorId: req.userId! },
      include: { author: true }
    });
    res.json(post);
  } catch (e) { next(e); }
});

export default r;