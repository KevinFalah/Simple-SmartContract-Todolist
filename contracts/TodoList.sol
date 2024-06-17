// SPDX-License-Identifier: MIT

pragma solidity 0.8.26;

contract TodoList {
    address public assigner;
    uint public idTask;
    mapping (address => Task[]) public tasks;

    enum statusTask {
        DONE,
        PROGRESS,
        NEW
    }

    struct Task {
      uint id;
      string  nameTask;
      statusTask status;
    }

    modifier onlyAssigner() {
        require(msg.sender == assigner, "Only Assigner can call this function");
        _;
    }

    constructor() {
        assigner = msg.sender;
        idTask = 0;
    }

    function createTask(string memory title, address assigneTo) public onlyAssigner {
        Task memory newTask = Task({
            id: idTask,
            nameTask: title,
            status: statusTask.NEW
        });
        tasks[assigneTo].push(newTask);
        idTask++;
    }

    function checkMyAllTasks() public view returns (Task[] memory) {
        return tasks[msg.sender];
    }

    function checkMySpesificTask(uint _id) public view returns (Task memory) {
        Task[] storage userTask = tasks[msg.sender];
        Task memory viewTask;
        bool taskFound = false;

        for (uint i = 0; i < userTask.length; i++) {
            if (userTask[i].id == _id) {
                taskFound = true;
                viewTask = userTask[i];
                break;
            }
        }
        require(taskFound, "Task not found!");
        return viewTask;
    }

    function changeStatusTask(uint _id, uint _statusTask) public {
        require(tasks[msg.sender].length > 0, "You don't have any task");
        require(_statusTask <= uint(statusTask(statusTask.NEW)) && _statusTask >= uint(statusTask(statusTask.DONE)), "Status not defined");

        Task[] storage userTask = tasks[msg.sender];
        uint idx;
        bool taskFound = false;

        for (uint i = 0; i < userTask.length; i++) {
            if (userTask[i].id == _id) {
                taskFound = true;
                idx = i;
                break;
            }
        }
        require(taskFound, "Task not found!");
        userTask[idx].status = statusTask(_statusTask);
    }

    function reassigneTask(address assigneBefore, address assigneTo, uint _id) external onlyAssigner {
        require(tasks[assigneBefore].length > 0, "User don't have task!");

        Task[] storage userTask = tasks[assigneBefore];
        Task memory tempTaskReassigne;
        bool taskFound = false;

        for (uint i = 0; i < userTask.length; i++) {
            if (userTask[i].id == _id) {
                taskFound = true;
                tempTaskReassigne = userTask[i];
                userTask[i] = userTask[userTask.length - 1];
                userTask.pop();
                break;
            }
        }

        require(taskFound, "Task Not Found");
        tasks[assigneTo].push(tempTaskReassigne);
    }
}