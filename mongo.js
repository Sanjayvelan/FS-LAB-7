const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 3000;

let db = null;
let client = null;

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Connect to MongoDB Compass
const connectDB = async () => {
  try {
    client = new MongoClient("mongodb://localhost:27017");
    await client.connect();
    db = client.db("employees"); // Connects to the 'employees' database
    console.log("Connected to MongoDB via Compass");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

app.get("/", (req, res) => {
  res.send(`
    <html>
    <head>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <h1>Employee Management</h1>
      <button onclick="window.location.href='/employees'">Get Employees</button>
      <button onclick="window.location.href='/add-employee'">Add Employee</button>
    </body>
    </html>
  `);
});

app.get("/employees", async (req, res) => {
  try {
    const employeesCollection = db.collection("employees");
    const employees = await employeesCollection.find({}).toArray();
    
    if (employees.length === 0) {
      res.send(`<h2>No employees found</h2>`);
    } else {
      let employeeTable = `
        <html>
        <head>
          <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
          <h2>Employees List</h2>
          <table>
            <tr><th>Name</th><th>Position</th></tr>
      `;
      employees.forEach((employee) => {
        employeeTable += `<tr><td>${employee.name}</td><td>${employee.position}</td></tr>`;
      });
      employeeTable += `</table><br><a href='/'>Go back</a></body></html>`;
      res.send(employeeTable);
    }
  } catch (err) {
    res.status(500).send("Error retrieving employees");
  }
});

app.get("/add-employee", (req, res) => {
  res.send(`
    <html>
    <head>
      <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
      <h2>Add New Employee</h2>
      <form action="/add-employee" method="POST">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required><br>
        <label for="position">Position:</label>
        <input type="text" id="position" name="position" required><br><br>
        <input type="submit" value="Add Employee">
      </form>
    </body>
    </html>
  `);
});

app.use(express.urlencoded({ extended: true }));

app.post("/add-employee", async (req, res) => {
  try {
    const { name, position } = req.body;
    const employeesCollection = db.collection("employees");
    await employeesCollection.insertOne({ name, position });
    res.send("Employee added successfully! <br> <a href='/'>Go back</a>");
  } catch (err) {
    res.status(500).send("Error adding employee");
  }
});

// Close MongoDB connection on server shutdown
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running at ${PORT}`);
});
