import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { AppBar, Toolbar, Typography, Box, IconButton, TextField, Button } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import { AuthContext } from "../contexts/AuthContext";


 function HomeComponent() {

    let navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");

   const { addToUserHistory } = useContext(AuthContext);


   let handleJoinVideocall = async () => {
        if (!meetingCode || meetingCode.trim() === "") return;
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    return(
       <>

       <AppBar position="static" sx={{
         background: "rgba(255,255,255,0.15)",
         boxShadow: "0 8px 32px rgba(31,38,135,0.37)",
         backdropFilter: "blur(10px)",
         WebkitBackdropFilter: "blur(10px)",
         border: "1px solid rgba(255,255,255,0.3)",
         color: "white"
       }}>
         <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
           <Typography variant="h6" component="div" sx={{ color: "#FF9839", fontWeight: 600 }}>
             Meow Video Call
           </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              aria-label="Home"
              onClick={() => navigate("/")}
              sx={{ color: "#FF9839", '&:hover': { color: '#FF7A00' } }}
            >
              <HomeIcon />
            </IconButton>
            <Button
              startIcon={<RestoreIcon />}
              onClick={() => navigate("/history")}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #FF8C00, #FF9839)",
                color: "#ffffff",
                boxShadow: "0 8px 24px rgba(31,38,135,0.37)",
                borderRadius: "10px",
                '&:hover': { background: "linear-gradient(90deg, #FF7A00, #FF8F2F)" }
              }}
            >
              History
            </Button>
            <Button
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #FF8C00, #FF9839)",
                color: "#ffffff",
                boxShadow: "0 8px 24px rgba(31,38,135,0.37)",
                borderRadius: "10px",
                '&:hover': { background: "linear-gradient(90deg, #FF7A00, #FF8F2F)" }
              }}
            >
              Logout
            </Button>
          </Box>
         </Toolbar>
       </AppBar>
       <div className="meetContainer">
        <div className="leftPanel">
            <div>
            <h2 style={{ marginBottom: "12px" }}>Providing Quality Meow Call</h2>
            <div style={{display: "flex" , gap: "10px", flexWrap: "wrap"}}>
                <TextField
                  onChange={e => setMeetingCode(e.target.value)}
                  id="outlined-basic"
                  label="Meeting Code"
                  variant="outlined"
                  required
                  sx={{
                    input: { color: "#000000" },
                    label: { color: "#000000" },
                    '& .MuiOutlinedInput-root': {
                      background: "#ffffff",
                      borderRadius: "12px",
                      '& fieldset': { borderColor: "rgba(0,0,0,0.2)" },
                      '&:hover fieldset': { borderColor: "#FF9839" },
                      '&.Mui-focused fieldset': { borderColor: "#FF9839" }
                    },
                    minWidth: '240px',
                    flex: '1 1 240px'
                  }}
                ></TextField>
                <Button
                  variant="contained"
                  onClick={handleJoinVideocall}
                  sx={{
                    background: "linear-gradient(90deg, #FF8C00, #FF9839)",
                    color: "#ffffff",
                    boxShadow: "0 8px 24px rgba(31,38,135,0.37)",
                    '&:hover': { background: "linear-gradient(90deg, #FF7A00, #FF8F2F)" },
                    flex: '0 0 auto'
                  }}
                  disabled={!meetingCode || meetingCode.trim() === ""}
                >
                  Join
                </Button>
            </div>
        </div>
        </div>

        <div className="rightPanel">
            <img src="/logo.png" alt="" />
        </div>
       </div>
       
       </>
    )
}

export default withAuth(HomeComponent);