import { Request, Response } from "express";
import { prisma } from "../app";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      res.status(400).json({ error: "Email and name are required" });
      return;
    }

    const newUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
};
