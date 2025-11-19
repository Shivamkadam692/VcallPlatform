import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";




const defaultTheme = createTheme({
    palette: {
        primary: { main: '#FF9839' },
        secondary: { main: '#FF8C00' }
    }
});

export default function Authentication() {

    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");


    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const mode = params.get("mode");
        if (mode === "register") setFormState(1);
        if (mode === "login") setFormState(0);
    }, [location.search]);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                let result = await handleLogin(username, password);


                console.log(result);

                setMessage(result);
                setOpen(true);
                setUsername("");
                setPassword("");
                setError("");
                setFormState(0);

                setTimeout(() => navigate("/home"), 500);
            }

            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setMessage(result);
                setOpen(true);
                setUsername("");
                setPassword("");
                setError("");
                setFormState(0);
            }
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message || "Something went wrong");
        }
    }



    return (
        <ThemeProvider theme={defaultTheme}>
            <AppBar position="static" sx={{
                background: 'rgba(255,255,255,0.15)',
                boxShadow: '0 8px 32px rgba(31,38,135,0.37)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white'
            }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="div" sx={{ color: '#FF9839', fontWeight: 600 }}>
                        Meow Video Call
                    </Typography>
                    <IconButton aria-label="Home" onClick={() => navigate('/home')} sx={{ color: '#FF9839', '&:hover': { color: '#FF7A00' } }}>
                        <HomeIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Grid container component="main" sx={{ height: 'calc(100vh - 64px)', backgroundColor: '#ffffff' }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundColor: '#ffffff'
                    }}
                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 8px 32px rgba(31,38,135,0.37)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <div>
                            <Button variant={formState === 0 ? "contained" : "text"} onClick={() => { setFormState(0) }} sx={formState === 0 ? {
                                background: 'linear-gradient(90deg, #FF8C00, #FF9839)',
                                color: '#ffffff',
                                boxShadow: '0 8px 24px rgba(31,38,135,0.37)',
                                borderRadius: '10px'
                            } : { color: '#FF9839' }}>
                                Sign In
                            </Button>
                            <Button variant={formState === 1 ? "contained" : "text"} onClick={() => { setFormState(1) }} sx={formState === 1 ? {
                                background: 'linear-gradient(90deg, #FF8C00, #FF9839)',
                                color: '#ffffff',
                                boxShadow: '0 8px 24px rgba(31,38,135,0.37)',
                                borderRadius: '10px',
                                ml: 1
                            } : { color: '#FF9839', ml: 1 }}>
                                Sign Up
                            </Button>
                        </div>
                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            {formState === 1 ? <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Full Name"
                                name="name"
                                value={name}
                                autoFocus
                                onChange={(e) => setName(e.target.value)}
                                sx={{
                                    input: { color: '#000000' },
                                    label: { color: '#000000' },
                                    '& .MuiOutlinedInput-root': {
                                        background: '#ffffff',
                                        borderRadius: '12px',
                                        '& fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                                        '&:hover fieldset': { borderColor: '#FF9839' },
                                        '&.Mui-focused fieldset': { borderColor: '#FF9839' }
                                    }
                                }}
                            /> : <></>}
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus={formState === 0}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{
                                    input: { color: '#000000' },
                                    label: { color: '#000000' },
                                    '& .MuiOutlinedInput-root': {
                                        background: '#ffffff',
                                        borderRadius: '12px',
                                        '& fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                                        '&:hover fieldset': { borderColor: '#FF9839' },
                                        '&.Mui-focused fieldset': { borderColor: '#FF9839' }
                                    }
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                sx={{
                                    input: { color: '#000000' },
                                    label: { color: '#000000' },
                                    '& .MuiOutlinedInput-root': {
                                        background: '#ffffff',
                                        borderRadius: '12px',
                                        '& fieldset': { borderColor: 'rgba(0,0,0,0.2)' },
                                        '&:hover fieldset': { borderColor: '#FF9839' },
                                        '&.Mui-focused fieldset': { borderColor: '#FF9839' }
                                    }
                                }}
                            />

                            <p style={{ color: "red" }}>{error}</p>

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2,
                                    background: 'linear-gradient(90deg, #FF8C00, #FF9839)',
                                    color: '#ffffff',
                                    boxShadow: '0 8px 24px rgba(31,38,135,0.37)',
                                    borderRadius: '10px',
                                    '&:hover': { background: 'linear-gradient(90deg, #FF7A00, #FF8F2F)' }
                                }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Login" : "Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar

                open={open}
                autoHideDuration={4000}
                message={message}
            />

        </ThemeProvider>
    );
}