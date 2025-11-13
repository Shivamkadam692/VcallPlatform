import React from "react";
import "../App.css"
import {Link} from "react-router-dom"

export default function LandingPage(){
    return(
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2>Meow Call </h2>
                </div>
                <div className="navList">
                    <p>Join As Meows</p>
                    <p>Register</p>
                    <div role="button">
                        <p>Login</p>
                    </div>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1> <span style={{color: "#FF9839"}}>Connect </span><span style={{color: "#000000ff"}}>With Your Meows </span></h1>
                    <p style={{color: "#131211ff"}}>Cover Distance With Meow Calls</p>
                    
                    <div role="button">
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/mb.png" alt="" />
                </div>
            </div>
            
        </div>
    )
}