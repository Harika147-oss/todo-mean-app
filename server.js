const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ------------------------------------------------
// FILE PATHS
// ------------------------------------------------

const tasksFile = path.join(__dirname, "tasks.json");
const usersFile = path.join(__dirname, "users.json");

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
    try {
        const tasks = JSON.parse(
            fs.readFileSync(tasksFile, "utf8")
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

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add task"
        });
    }
});

// ------------------------------------------------
// GET USER TASKS
// ------------------------------------------------

app.get("/tasks", (req, res) => {
    try {
        const tasks = JSON.parse(
            fs.readFileSync(tasksFile, "utf8")
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

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to load tasks"
        });
    }
});

// ------------------------------------------------
// UPDATE TASK
// ------------------------------------------------

app.put("/tasks/:id", (req, res) => {
    try {
        const tasks = JSON.parse(
            fs.readFileSync(tasksFile, "utf8")
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

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update task"
        });
    }
});

// ------------------------------------------------
// DELETE TASK
// ------------------------------------------------

app.delete("/tasks/:id", (req, res) => {
    try {
        let tasks = JSON.parse(
            fs.readFileSync(tasksFile, "utf8")
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

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to delete task"
        });
    }
});

// ------------------------------------------------
// REGISTER
// ------------------------------------------------

app.post("/register", (req, res) => {
    try {
        const users = JSON.parse(
            fs.readFileSync(usersFile, "utf8")
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

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// ------------------------------------------------
// LOGIN
// ------------------------------------------------

app.post("/login", (req, res) => {
    try {
        const users = JSON.parse(
            fs.readFileSync(usersFile, "utf8")
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

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

// ------------------------------------------------
// START SERVER
// ------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});