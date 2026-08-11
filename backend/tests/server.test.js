const request = require("supertest");
const app = require("../app");

describe("Book Shelf Swap API", () => {
    test("GET / should return API running message", async () => {
        const response = await request(app).get("/");

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty(
            "message",
            "API is running"
        );
    });
});