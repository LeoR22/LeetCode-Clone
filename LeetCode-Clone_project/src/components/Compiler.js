import { useState, useEffect } from "react";
import axios from "axios";
import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { ThemeProvider, createTheme } from "@mui/material";
import Button from "@mui/material/Button";
import "./Editor.css";
import {useNavigate} from "react-router-dom"
import myimage from "../assets/LeapCode.png"
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link
} from 'react-router-dom';

import {
  Card,
  CardHeader,
  Switch,
  CardContent,
  Box,
  Container,
  Typography,
  FormGroup,
  FormControlLabel,
  CssBaseline,
} from "@mui/material";

export const Compiler = () => {
  // Define theme settings
  const light = {
    palette: {
      mode: "light",
    },
  };

  const dark = {
    palette: {
      mode: "dark",
    },
  };

  // The light theme is used by default
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [output, setOutput] = useState(">>>");
  const [darkTextArea,setDarkTextArea] = useState("")
  const navigate = useNavigate();

  // This function is triggered when the Switch component is toggled
  const changeTheme = async () => {
    await setIsDarkTheme(!isDarkTheme);
    if (isDarkTheme) {
      setEditorTheme();
      setDarkTextArea("")
    } else {
      setEditorTheme(dracula);
      setDarkTextArea("outputarea")
    }
  };

  const submitCode = async () => {
    const payload = { language, code };
    let op;
    try {
      op = await axios.post("/api/run", payload);
      setOutput(op.data.message)
    } catch {
      console.log("error during postin and featching code");
    }
  };

  const [editorTheme, setEditorTheme] = useState();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("py");
  const [autocomplete, setAutocomplete] = useState([python({})]);

  return (
    <>
      <ThemeProvider
        theme={isDarkTheme ? createTheme(dark) : createTheme(light)}
      >
        <CssBaseline />
        
        <Box display="flex" justifyContent="flex-end" align="flex-end">


        <img src={myimage} alt="LogoImage" width={40} height={40} style={{borderRadius: "50%",padding:"2px"}}></img>
      <span style={{  width:" 62%",padding:"10px",color:"green"}}>LeapCode - Learn by Solving!</span>
        <Button variant="text" onClick={()=>navigate("/")} style={{color:"green"}}>Online Compiler</Button>
        <Button variant="text" onClick={()=>navigate("/editor") } style={{color:"green"}}>Coding Challenge</Button>


          <FormControlLabel style={{color:"green"}}
            control={<Switch checked={isDarkTheme} onChange={changeTheme} />}
            label="Dark Theme"
          />
        </Box>
        <Container>
          <Box display="flex" justifyContent="flex-end" align="flex-end">
            <div>
              <label style={{color:"green"}}>language: </label>
              <select
                value={language}
                onChange={async (e) => {
                  await setLanguage(e.target.value);
                  if (e.target.value === "py") {
                    setAutocomplete([python({})]);
                  } else {
                    setAutocomplete([javascript({})]);
                  }
                }}
              >
                <option value="py">Python3</option>
                <option value="js">Javascript</option>
              </select>
            </div>
          </Box>

          <Box
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
          >
            <div
              className="shadowEffect"
              style={{
                minHeight: "84.7vh",
                maxHeight: "84.7vh",
                padding: "10px",
                marginTop: "0px",
              }}
            >
              <Box>
                <CodeMirror
                  value=""
                  height="70vh"
                  width="45vw"
                  extensions={autocomplete}
                  theme={editorTheme}
                  onChange={(value, viewUpdate) => {
                    setCode(value);
                    console.log(code);
                  }}
                />
                <br />
                <div>
                  <br></br>
                </div>
                <Button
                  style={{
                    maxWidth: "95vh",
                    maxHeight: "30px",
                    minWidth: "95vh",
                    backgroundColor: "green",
                  }}
                  variant="contained"
                  onClick={submitCode}
                >
                  Submit
                </Button>
              </Box>
            </div>

            <Box>
              {" "}
              <Typography
                component="h2"
                style={{
                  width: "40vw",
                  minHeight: "85vh",
                  maxHeight: "85vh",
                  padding: "5px",
                  margin: "0px",
                  marginTop: "-2px",
                }}
                sx={{ border: 1, borderRadius: 1 }}
              >
                <div
                  className="shadowEffect"
                  id="growth"
                  style={{
                    minHeight: "84.7vh",
                    maxHeight: "84.7vh",
                    padding: "10px",
                    margin: "-5px",
                  }}>
                  <textarea className = {darkTextArea}  rows="37" cols="66" value={output}  readOnly></textarea>
                </div>
              </Typography>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  );
};
