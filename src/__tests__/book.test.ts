import { describe, it, expect, afterAll } from "@jest/globals";
import request from "supertest";
import app, { prisma } from "../app";

describe("Book API Endpoints", () => {
  it("should create a new book and return a 201 status", async () => {
    const newBook = {
      title: "Learn Backend",
      author: "DimIoann",
      summary: "This book talks about backend fundamentals",
      pages: 5,
    };

    const response = await request(app).post("/api/books").send(newBook);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("Learn Backend");
  });

  // Test 2: Get All Books (R in CRUD) - THIS WILL BE RED 🔴
  it("should fetch all books and return a 200 status", async () => {
    // Step 1: Use Supertest to send a GET request to '/api/books'
    const response = await request(app).get("/api/books");

    // Step 2: Write an expect statement to check if response.status is 200
    // YOUR CODE HERE
    expect(response.status).toBe(200);
    // Step 3: Write an expect statement to check if the response body is an Array
    // (Because fetching ALL books should return a list/array of books!)
    // Hint: expect(Array.isArray(response.body)).toBe(true);
    // YOUR CODE HERE
    expect(Array.isArray(response.body)).toBe(true);
  });
  // Test 3: Get a Single Book by ID
  it("should fetch a single book by ID and return a 200 status", async () => {
    // Step 1: We need a book in the database to fetch!
    // Let's create one directly using Prisma so we know its exact ID.
    const testBook = await prisma.book.create({
      data: {
        title: "The TDD Handbook",
        author: "DimIoann",
        summary: "Learning to test APIs",
        pages: 100,
      },
    });

    // Step 2: Use Supertest to send a GET request to `/api/books/${testBook.id}`
    // YOUR CODE HERE
    const response = await request(app).get(`/api/books/${testBook.id}`);
    // Step 3: Write an expect statement to check if the status is 200
    // YOUR CODE HERE
    expect(response.status).toBe(200);
    // Step 4: Write an expect statement to check if the response.body.title matches "The TDD Handbook"
    // YOUR CODE HERE
    expect(response.body.title).toBe("The TDD Handbook");
  });

  // Test 4: Update a Book (U in CRUD)
  it("should update an existing book and return a 200 status", async () => {
    // Step 1: Create a book to update
    const bookToUpdate = await prisma.book.create({
      data: {
        title: "Wrong Title",
        author: "DimIoann",
        summary: "Needs fixing",
        pages: 10,
      },
    });

    const updatedData = {
      title: "Correct Title",
    };

    // Step 2: Send PUT request AND send the data payload!
    const response = await request(app)
      .put(`/api/books/${bookToUpdate.id}`)
      .send(updatedData); // <-- Don't forget this!

    // Step 3 & 4: Check that the status is 200 and the title updated
    expect(response.status).toBe(200);
    expect(response.body.title).toBe("Correct Title");
  });

  // Test 5: Delete a Book (D in CRUD)
  it("should delete a book by ID and return a 200 status", async () => {
    // Step 1: Create a temporary book that we are going to delete
    const bookToDelete = await prisma.book.create({
      data: {
        title: "Book to Delete",
        author: "DimIoann",
        summary: "Goodbye world",
        pages: 1,
      },
    });

    const response = await request(app).delete(`/api/books/${bookToDelete.id}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Book deleted successfully");
  });
  // Test 6: Validation - Should fail if title is missing
  it("should return 400 if the title is missing", async () => {
    // We send a book that is missing the 'title' field
    const brokenBook = {
      author: "Mystery Author",
      summary: "A book with no name",
      pages: 120,
    };

    const response = await request(app).post("/api/books").send(brokenBook);

    // We EXPECT the server to say "400 Bad Request"
    expect(response.status).toBe(400);

    // We EXPECT the server to send an error message
    expect(response.body.error).toBe("Title and author are required");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
