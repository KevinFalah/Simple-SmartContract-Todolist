const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TodoList Contract", function () {
  let TodoList;
  let todoList;
  let assigner;
  let user1;
  let user2;

  beforeEach(async function () {
    TodoList = await ethers.getContractFactory("TodoList");
    [assigner, user1, user2] = await ethers.getSigners();
    todoList = await TodoList.deploy();
    await todoList.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right assigner", async function () {
      expect(await todoList.assigner()).to.equal(assigner.address);
    });

    it("Should initialize idTask to 0", async function () {
      expect(await todoList.idTask()).to.equal(0);
    });
  });

  describe("Create Task", function () {
    it("Should create a new task", async function () {
      await todoList.createTask("Task 1", user1.address);
      const tasks = await todoList.checkMyAllTasks();
      expect(tasks.length).to.equal(1);
      expect(tasks[0].nameTask).to.equal("Task 1");
    });

    it("Should only allow the assigner to create tasks", async function () {
      await expect(todoList.connect(user1).createTask("Task 2", user1.address))
        .to.be.revertedWith("Only Assigner can call this function");
    });
  });

  describe("Task Management", function () {
    beforeEach(async function () {
      await todoList.createTask("Task 1", user1.address);
    });

    it("Should allow users to check their tasks", async function () {
      const tasks = await todoList.connect(user1).checkMyAllTasks();
      expect(tasks.length).to.equal(1);
      expect(tasks[0].nameTask).to.equal("Task 1");
    });

    it("Should allow users to change the status of their tasks", async function () {
      await todoList.connect(user1).changeStatusTask(0, 1);
      const task = await todoList.connect(user1).checkMySpesificTask(0);
      expect(task.status).to.equal(1);
    });

    it("Should only allow valid status values", async function () {
      await expect(todoList.connect(user1).changeStatusTask(0, 3))
        .to.be.revertedWith("Status not defined");
    });

    it("Should allow the assigner to reassign tasks", async function () {
      await todoList.reassigneTask(user1.address, user2.address, 0);
      const tasksUser1 = await todoList.connect(user1).checkMyAllTasks();
      const tasksUser2 = await todoList.connect(user2).checkMyAllTasks();
      expect(tasksUser1.length).to.equal(0);
      expect(tasksUser2.length).to.equal(1);
      expect(tasksUser2[0].nameTask).to.equal("Task 1");
    });

    it("Should revert if the task to reassign is not found", async function () {
      await expect(todoList.reassigneTask(user1.address, user2.address, 999))
        .to.be.revertedWith("Task Not Found");
    });

    it("Should revert if the user doesn't have the task", async function () {
      await expect(todoList.reassigneTask(user2.address, user1.address, 0))
        .to.be.revertedWith("User don't have task!");
    });
  });
});
