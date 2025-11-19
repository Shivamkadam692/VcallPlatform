import React from "react";
import "../styles/landing.css"
import { Link } from "react-router-dom"

export default function LandingPage(){
    return(
        <div className="landingPageContainer">
            <nav style={{
                position: "sticky",
                top: 0,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 20px",
                background: "rgba(255,255,255,0.15)",
                boxShadow: "0 8px 32px rgba(31,38,135,0.37)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "16px",
                margin: "12px",
                zIndex: 10
            }}>
                <div className="navHeader">
                    <h2>Meow Call</h2>
                </div>
                <div className="navList" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <Link to="/auth?mode=register" style={{
                        padding: "8px 14px",
                        borderRadius: "12px",
                        color: "inherit",
                        textDecoration: "none",
                        background: "rgba(255,255,255,0.2)",
                        border: "1px solid rgba(255,255,255,0.25)"
                    }}>Join As Meows</Link>
                    <Link to="/auth?mode=register" style={{
                        padding: "8px 14px",
                        borderRadius: "12px",
                        color: "inherit",
                        textDecoration: "none",
                        background: "rgba(255,255,255,0.2)",
                        border: "1px solid rgba(255,255,255,0.25)"
                    }}>Register</Link>
                    <Link to="/auth?mode=login" style={{
                        padding: "8px 14px",
                        borderRadius: "12px",
                        color: "inherit",
                        textDecoration: "none",
                        background: "rgba(255,255,255,0.2)",
                        border: "1px solid rgba(255,255,255,0.25)"
                    }}>Login</Link>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div>
                    <h1> <span style={{color: "#FF9839"}}>Connect </span><span style={{color: "#000000ff"}}>With Your Meows </span></h1>
                    <p style={{color: "#131211ff"}}>Cover Distance With Meow Calls</p>
                    
                    <div role="button" style={{
                        display: "inline-block",
                        padding: "10px 18px",
                        borderRadius: "14px",
                        background: "rgba(255,255,255,0.25)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        boxShadow: "0 8px 32px rgba(31,38,135,0.37)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)"
                    }}>
                        <Link to={"/auth?mode=register"} style={{ textDecoration: "none", color: "inherit" }}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/mb.png" alt="" />
                </div>
            </div>
            
        </div>
    )
}