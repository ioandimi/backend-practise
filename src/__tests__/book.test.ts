import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app, { prisma } from "../app";

// We create a variable to hold our User's ID so all tests can share it!
let testUserId: string;

// THE MAGIC SETUP: This runs once before ANY tests start
beforeAll(async () => {
  // 1. Create a real User in the database
  const user = await prisma.user.create({
    data: {
      email: "testuser@example.com",
      name: "Test User",
    },
  });

  // 2. Save that user's ID to our variable
  testUserId = user.id;
});

describe("Book API Endpoints", () => {
  // Test 1: Create Book
  it("should create a new book and return a 201 status", async () => {
    const newBook = {
      title: "Learn Backend",
      userId: testUserId, // <-- CHANGED: We use the real User ID instead of 'author'
      summary: "This book talks about backend fundamentals",
      pages: 5,
    };

    const response = await request(app).post("/api/books").send(newBook);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Learn Backend");
  });

  // Test 2: Get All Books
  it("should fetch all books and return a 200 status", async () => {
    const response = await request(app).get("/api/books");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  // Test 3: Get a Single Book by ID
  it("should fetch a single book by ID and return a 200 status", async () => {
    const testBook = await prisma.book.create({
      data: {
        title: "The TDD Handbook",
        userId: testUserId, // <-- CHANGED
        summary: "Learning to test APIs",
        pages: 100,
      },
    });

    const response = await request(app).get(`/api/books/${testBook.id}`);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("The TDD Handbook");
  });

  // Test 4: Update a Book
  it("should update an existing book and return a 200 status", async () => {
    const bookToUpdate = await prisma.book.create({
      data: {
        title: "Wrong Title",
        userId: testUserId, // <-- CHANGED
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

  // Test 5: Delete a Book
  it("should delete a book by ID and return a 200 status", async () => {
    const bookToDelete = await prisma.book.create({
      data: {
        title: "Book to Delete",
        userId: testUserId, // <-- CHANGED
        summary: "Goodbye world",
        pages: 1,
      },
    });

    const response = await request(app).delete(`/api/books/${bookToDelete.id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Book deleted successfully");
  });

  // Test 6: Validation
  it("should return 400 if the title is missing", async () => {
    const brokenBook = {
      userId: testUserId, // We provide the ID, but skip the title!
      summary: "A book with no name",
      pages: 120,
    };

    const response = await request(app).post("/api/books").send(brokenBook);

    expect(response.status).toBe(400);
    // CHANGED: We now expect it to complain about the userId, not author!
    expect(response.body.error).toBe("Title and userId are required");
  });
});

// THE CLEANUP: This runs after all tests are finished
afterAll(async () => {
  await prisma.book.deleteMany(); // Delete all test books
  await prisma.user.deleteMany(); // Delete the test user
  await prisma.$disconnect();
});
