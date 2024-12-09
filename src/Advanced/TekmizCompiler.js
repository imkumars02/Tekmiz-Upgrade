import React, { useState } from "react";
import axios from "axios";
import "./TekmizCompiler.scss";
import UserHeader from "../Header/UserHeader";
import MonacoEditor from "react-monaco-editor";

const languages = [
  { id: "java", name: "Java" },
  { id: "python", name: "Python" },
  { id: "javascript", name: "JavaScript" },
  { id: "ruby", name: "Ruby" },
  { id: "csharp", name: "C#" },
  { id: "php", name: "PHP" },
];

const defaultCode = {
  java: '// Your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  python: 'import sys\nname = sys.stdin.readline()\nprint("Hello " + name)',
  javascript:
    'const name = prompt("Enter your name: ");\nconsole.log("Hello " + name);',
  ruby: 'name = gets.chomp\nputs "Hello " + name',
  csharp:
    'using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
  php: '<?php\necho "Hello, World!";\n?>',
};

const CodeEditor = () => {
  const [language, setLanguage] = useState(languages[0].id);
  const [code, setCode] = useState(defaultCode[language]);
  const [output, setOutput] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    setCode(defaultCode[newLanguage]);
    setOutput(""); // Reset output on language change
    setInputValue(""); // Reset input
  };

  const executeCode = async () => {
    setOutput("Executing code...\n");

    const data = JSON.stringify({
      language: language,
      stdin: inputValue,
      files: [
        {
          name: `index.${language}`,
          content: code,
        },
      ],
    });

    try {
      const response = await axios.post(
        "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
        data,
        {
          headers: {
            "x-rapidapi-key":
              "53335ef937msh1e452d2a916b013p168a60jsn1bae19569914", // Replace with your actual API key
            "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
            "Content-Type": "application/json",
          },
        }
      );

      const { stdout, stderr, stdin } = response.data;

      let output = "Execution completed.\n";

      if (stdout) {
        output += `Output:\n${stdout}\n`;
      }
      if (stderr) {
        output += `Errors:\n${stderr}\n`;
      }
      if (stdin) {
        output += `Input Provided:\n${stdin}\n`;
      }

      setOutput(output);
    } catch (error) {
      setOutput((prevOutput) => prevOutput + "Error:\n" + error.message);
    }
  };

  return (
    <>
      <UserHeader />
      <div className="CodeEditor">
        <h1>Code Compiler</h1>
        <div className="language-select">
          <label htmlFor="language-select">Select Language :</label>
          <select
            id="language-select"
            value={language}
            onChange={handleLanguageChange}
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <MonacoEditor
          width="100%"
          height="300"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={setCode}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
          }}
          className="Editor"
        />

        <textarea
          className="input-area"
          rows={3}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter input for the code here..."
        />

        <button className="execute-button" onClick={executeCode}>
          Execute Code
        </button>

        <div className="output-container">
          <h3>Output:</h3>
          <pre>{output}</pre>
        </div>
      </div>
    </>
  );
};

export default CodeEditor;
