import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app, { prisma } from "../app";

beforeAll(async () => {
  await prisma.user.create({
    data: {
      email: "author@test.com",
      name: "Famous Author",
      books: {
        create: {
          title: "My First Bestseller",
          summary: "A great book",
          pages: 300,
        },
      },
    },
  });
});

describe("User API Endpoints", () => {
  it("should fetch all users and include their books", async () => {
    const response = await request(app).get("/api/users");

    expect(response.body[0].name).toBe("Famous Author");
    expect(response.body[0].books[0].title).toBe("My First Bestseller");
  });
});

afterAll(async () => {
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
