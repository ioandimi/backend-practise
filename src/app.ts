import "dotenv/config";
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { error } from "node:console";

const app = express();
app.use(express.json());

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

app.post("/api/books", async (req: Request, res: Response) => {
  try {
    const { title, author, summary, pages } = req.body;

    if (!title || !author) {
      res.status(400).json({ error: "Title and author are required" });
      return;
    }

    const newBook = await prisma.book.create({
      data: {
        title: title,
        author: author,
        summary: summary,
        pages: pages,
      },
    });

    res.status(201).json(newBook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create book" });
  }
});

app.get("/api/books", async (req: Request, res: Response) => {
  try {
    const allBooks = await prisma.book.findMany({});

    res.status(200).json(allBooks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

app.get("/api/books/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      res.status(404).json({ error: "Book not found" });
      return;
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

app.put(`/api/books/:id`, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { title, author, summary, pages, published } = req.body;

    const updatedBook = await prisma.book.update({
      where: { id },
      data: { title, author, summary, pages, published },
    });
    res.status(200).json(updatedBook);
  } catch (error) {
    (console.error(error),
      res.status(500).json({ error: "Failed to update book" }));
  }
});

app.delete("/api/books/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    await prisma.book.delete({
      where: { id },
    });

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

export default app;
