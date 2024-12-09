const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(bodyParser.json());

let currentExecution = {};

app.post("/execute", (req, res) => {
  const { language, code, input } = req.body;

  switch (language) {
    case "java":
      const className = `Main_${Date.now()}`; // Generate unique class name
      const javaFileName = `${className}.java`;
      const modifiedCode = code.replace(/public class Main/g, `public class ${className}`);

      fs.writeFileSync(javaFileName, modifiedCode);

      // Use a temporary input file to simulate user input
      const inputFileName = "input.txt";
      fs.writeFileSync(inputFileName, input || "");

      exec(`javac ${javaFileName} && java ${className} < ${inputFileName}`, (error, stdout, stderr) => {
        if (error) {
          return res.json({ output: stderr || error.message });
        }
        res.json({ output: stdout });
      });
      break;

    // Handle other languages similarly if needed
    default:
      res.status(400).json({ output: "Language not supported" });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
