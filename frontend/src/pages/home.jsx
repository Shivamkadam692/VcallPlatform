import React, { useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { IconButton } from "@mui/material";
import {Button} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
 function HomeComponent() {

    let navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");


    let handleJoinVideocall = async () => {
       navigate(`/${meetingCode}`)
    }
    return(
       <>

       <div className="navBar">

        <div style={{display: "flex", alignItems: "center"}}>
            <h3>Meow Video call</h3>
        </div>

        <div style={{display: "flex",alignItems: "center" }}>
            <IconButton>
                <RestoreIcon/>
            </IconButton>
            <p>History</p>

            <Button onClick={()=> {
                localStorage.removeItem("token")
                navigate("/auth")
            }}>

                Logout

            </Button>

        </div>

       </div>
       
       </>
    )
}

export default withAuth(HomeComponent);