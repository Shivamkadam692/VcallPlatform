import React, { useMemo } from "react";
import "../styles/landing.css";
import { Link } from "react-router-dom";

export default function LandingPage() {
    const backgroundStyle = useMemo(() => ({
        backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)`
    }), []);

    return (
        <div className="landingPageContainer" style={backgroundStyle}>
            <nav className="landingNav">
                <div className="navHeader">
                    <h2>Meow Call</h2>
                </div>
                <div className="navList">
                    <Link to="/auth?mode=register" className="navAction">
                        Join As Meows
                    </Link>
                    <Link to="/auth?mode=register" className="navAction">
                        Register
                    </Link>
                    <Link to="/auth?mode=login" className="navAction navActionPrimary">
                        Login
                    </Link>
                </div>
            </nav>

            <div className="landingMainContainer">
                <div className="heroCopy">
                    <h1>
                        <span className="highlight">Connect </span>
                        <span style={{ color: "black" }}>With Your Meows </span>
                    </h1>
                    <p >Cover Distance With Meow Calls</p>

                    <Link to="/auth?mode=register" className="ctaButton">
                        Get Started
                    </Link>
                </div>
                <div className="heroGraphic">
                    <img src="/mb.png" alt="Video calling illustration" loading="lazy" />
                </div>
            </div>

        </div>
    );
}