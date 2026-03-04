import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app, { prisma } from "../app";

let testUserId: string;

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      email: "testuser@example.com",
      name: "Test User",
    },
  });

  testUserId = user.id;
});

describe("Book API Endpoints", () => {
  it("should create a new book and return a 201 status", async () => {
    const newBook = {
      title: "Learn Backend",
      userId: testUserId,
      summary: "This book talks about backend fundamentals",
      pages: 5,
    };

    const response = await request(app).post("/api/books").send(newBook);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Learn Backend");
  });

  it("should fetch all books and return a 200 status", async () => {
    const response = await request(app).get("/api/books");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("should fetch a single book by ID and return a 200 status", async () => {
    const testBook = await prisma.book.create({
      data: {
        title: "The TDD Handbook",
        userId: testUserId,
        summary: "Learning to test APIs",
        pages: 100,
      },
    });

    const response = await request(app).get(`/api/books/${testBook.id}`);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("The TDD Handbook");
  });

  it("should update an existing book and return a 200 status", async () => {
    const bookToUpdate = await prisma.book.create({
      data: {
        title: "Wrong Title",
        userId: testUserId,
        summary: "Needs fixing",
        pages: 10,
      },
    });

    const updatedData = {
      title: "Correct Title",
    };

    const response = await request(app)
      .put(`/api/books/${bookToUpdate.id}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Correct Title");
  });

  it("should delete a book by ID and return a 200 status", async () => {
    const bookToDelete = await prisma.book.create({
      data: {
        title: "Book to Delete",
        userId: testUserId,
        summary: "Goodbye world",
        pages: 1,
      },
    });

    const response = await request(app).delete(`/api/books/${bookToDelete.id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Book deleted successfully");
  });

  it("should return 400 if the title is missing", async () => {
    const brokenBook = {
      userId: testUserId,
      summary: "A book with no name",
      pages: 120,
    };

    const response = await request(app).post("/api/books").send(brokenBook);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Title and userId are required");
  });
});

afterAll(async () => {
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
