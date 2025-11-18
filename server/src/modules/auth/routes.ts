import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../env";
const prisma = new PrismaClient();
const r = Router();

r.post("/register", async (req, res, next) => {
  try {
    const data = z.object({
      email: z.email(),
      password: z.string().min(6),
      name: z.string().min(5),
    }).parse(req.body);
    
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if(existingUser) return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({ data: { ...data, password: hashedPassword } });

    res.json({ id: newUser.id });

  }catch(error) {
    next(error);
  }
})

r.post("/login", async(req, res, next) => {
  try{
    const data = z.object({
      email: z.email(),
      password: z.string(),
    }).parse(req.body)

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    const ok = await bcrypt.compare(data.password, user.password);

    if(!ok || !user) return res.status(401).json({ message: "Invalid credentials"});

    const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl }});

  }catch(err) {
    next(err);
  }
})

export default r;