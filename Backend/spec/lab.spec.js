const request = require("supertest");
const app = require("..");
const { clearDatabase } = require("../db.connection");

const req = request(app);

describe("lab testing:", () => {
  let token, todoInDB;

  beforeAll(async () => {
    const myUser = {
      name: "test user",
      email: "testuser@gmail.com",
      password: "abc123",
    };

    await req.post("/user/signup").send(myUser);

    const loginRes = await req.post("/user/login").send(myUser);
    token = loginRes.body.token;

    const todoRes = await req
      .post("/todo")
      .send({ title: "my test todo" })
      .set({ authorization: token });
    todoInDB = todoRes.body.data;
  });

  describe("users routes:", () => {
    it("req to get(/search) ,expect to get the correct user with his name", async () => {
      const res = await req.get("/user/search").query({ name: "test user" });
      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("test user");
    });

    it("req to get(/search) with invalid name ,expect res status and res message to be as expected", async () => {
      const res = await req.get("/user/search").query({ name: "nobody" });
      expect(res.status).toBe(200);
      expect(res.body.message).toContain("There is no user with name: nobody");
    });

    it("req to delete(/) ,expect res status to be 200 and a message sent in res", async () => {
      const res = await req.delete("/user/");
      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
    });
  });

  describe("todos routes:", () => {
    it("req to patch(/) with id only ,expect res status and res message to be as expected", async () => {
      const res = await req
        .patch(`/todo/${todoInDB._id}`)
        .send({})
        .set({ authorization: token });
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("must provide title and id");
    });

    it("req to patch(/) with id and title ,expect res status and res to be as expected", async () => {
      const res = await req
        .patch(`/todo/${todoInDB._id}`)
        .send({ title: "updated title" })
        .set({ authorization: token });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("updated title");
    });

    it("req to get( /user) ,expect to get all user's todos", async () => {
      const emptyUser = {
        name: "has todos user",
        email: "hastodos@gmail.com",
        password: "abc123",
      };
      await req.post("/user/signup").send(emptyUser);
      const loginRes = await req.post("/user/login").send(emptyUser);
      const hasTodosToken = loginRes.body.token;

      await req
        .post("/todo")
        .send({ title: "a todo" })
        .set({ authorization: hasTodosToken });

      const res = await req
        .get("/todo/user")
        .set({ authorization: hasTodosToken });
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("req to get( /user) ,expect to not get any todos for user hasn't any todo", async () => {
      const emptyUser = {
        name: "empty user",
        email: "empty@gmail.com",
        password: "abc123",
      };
      await req.post("/user/signup").send(emptyUser);
      const loginRes = await req.post("/user/login").send(emptyUser);
      const emptyToken = loginRes.body.token;

      const res = await req
        .get("/todo/user")
        .set({ authorization: emptyToken });
      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
    });
  });

  afterAll(async () => {
    await clearDatabase();
  });
});
