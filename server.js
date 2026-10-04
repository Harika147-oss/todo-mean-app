const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const tasksFile = "tasks.json";
const usersFile = "users.json";


// ------------------------------------------------
// HOME
// ------------------------------------------------

app.get("/", (req, res) => {

    res.send("To-Do API Server is running successfully!");

});


// ------------------------------------------------
// ADD TASK
// ------------------------------------------------

app.post("/tasks", (req, res) => {

    const tasks = JSON.parse(
        fs.readFileSync(tasksFile)
    );

    const {
        title,
        userId,
        priority,
        dueDate
    } = req.body;


    if (!title || !userId) {

        return res.status(400).json({
            message: "Task title and user ID are required"
        });

    }


    const newTask = {

        id: Date.now(),

        userId: Number(userId),

        title: title,

        priority: priority || "Medium",

        dueDate: dueDate || "",

        completed: false

    };


    tasks.push(newTask);


    fs.writeFileSync(
        tasksFile,
        JSON.stringify(tasks, null, 2)
    );


    res.json(newTask);

});


// ------------------------------------------------
// GET USER TASKS
// ------------------------------------------------

app.get("/tasks", (req, res) => {

    const tasks = JSON.parse(
        fs.readFileSync(tasksFile)
    );

    const userId = Number(req.query.userId);


    if (!userId) {

        return res.status(400).json({
            message: "User ID is required"
        });

    }


    const userTasks = tasks.filter(
        task => task.userId === userId
    );


    res.json(userTasks);

});


// ------------------------------------------------
// UPDATE TASK
// ------------------------------------------------

app.put("/tasks/:id", (req, res) => {

    const tasks = JSON.parse(
        fs.readFileSync(tasksFile)
    );

    const id = Number(req.params.id);

    const userId = Number(req.body.userId);


    if (!userId) {

        return res.status(400).json({
            message: "User ID is required"
        });

    }


    const task = tasks.find(
        task =>
            task.id === id &&
            task.userId === userId
    );


    if (!task) {

        return res.status(404).json({
            message: "Task not found"
        });

    }


    if (req.body.title !== undefined) {

        task.title = req.body.title;

    }


    if (req.body.completed !== undefined) {

        task.completed = req.body.completed;

    }


    if (req.body.priority !== undefined) {

        task.priority = req.body.priority;

    }


    if (req.body.dueDate !== undefined) {

        task.dueDate = req.body.dueDate;

    }


    fs.writeFileSync(
        tasksFile,
        JSON.stringify(tasks, null, 2)
    );


    res.json(task);

});


// ------------------------------------------------
// DELETE TASK
// ------------------------------------------------

app.delete("/tasks/:id", (req, res) => {

    let tasks = JSON.parse(
        fs.readFileSync(tasksFile)
    );

    const id = Number(req.params.id);

    const userId = Number(req.query.userId);


    if (!userId) {

        return res.status(400).json({
            message: "User ID is required"
        });

    }


    const taskExists = tasks.some(
        task =>
            task.id === id &&
            task.userId === userId
    );


    if (!taskExists) {

        return res.status(404).json({
            message: "Task not found"
        });

    }


    tasks = tasks.filter(
        task =>
            !(
                task.id === id &&
                task.userId === userId
            )
    );


    fs.writeFileSync(
        tasksFile,
        JSON.stringify(tasks, null, 2)
    );


    res.json({
        message: "Task deleted successfully"
    });

});


// ------------------------------------------------
// REGISTER
// ------------------------------------------------

app.post("/register", (req, res) => {

    const users = JSON.parse(
        fs.readFileSync(usersFile)
    );

    const {
        name,
        email,
        password
    } = req.body;


    if (!name || !email || !password) {

        return res.status(400).json({
            message: "All fields are required"
        });

    }


    const existingUser = users.find(
        user =>
            user.email.toLowerCase() ===
            email.toLowerCase()
    );


    if (existingUser) {

        return res.status(400).json({
            message: "Email already registered"
        });

    }


    const newUser = {

        id: Date.now(),

        name: name,

        email: email,

        password: password

    };


    users.push(newUser);


    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2)
    );


    res.json({

        message: "Registration successful",

        user: {

            id: newUser.id,

            name: newUser.name,

            email: newUser.email

        }

    });

});


// ------------------------------------------------
// LOGIN
// ------------------------------------------------

app.post("/login", (req, res) => {

    const users = JSON.parse(
        fs.readFileSync(usersFile)
    );

    const {
        email,
        password
    } = req.body;


    if (!email || !password) {

        return res.status(400).json({
            message: "Email and password are required"
        });

    }


    const user = users.find(
        user =>
            user.email.toLowerCase() ===
            email.toLowerCase() &&
            user.password === password
    );


    if (!user) {

        return res.status(401).json({
            message: "Invalid email or password"
        });

    }


    res.json({

        message: "Login successful",

        user: {

            id: user.id,

            name: user.name,

            email: user.email

        }

    });

});


// ------------------------------------------------
// START SERVER
// ------------------------------------------------

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});