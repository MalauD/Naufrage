import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Background from "./../img/concert.jpg";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Alert } from "@mui/material";

const theme = createTheme();

export default function Login() {
    const [error, setError] = React.useState(undefined);
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        axios
            .post("/User/Login", {
                username: data.get("username"),
                password: data.get("password"),
            })
            .then((res) => {
                if (res.data.success) {
                    navigate("/");
                } else {
                    setError(
                        "Connection impossible, avez-vous bien rempli les champs ?"
                    );
                }
            })
            .catch((err) => {
                setError(
                    "Connection impossible, avez-vous bien rempli les champs ?"
                );
            });
    };

    return (
        <ThemeProvider theme={theme}>
            <Grid container component="main" sx={{ height: "100vh" }}>
                <CssBaseline />
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}
                    sx={{
                        backgroundImage: `url(${Background})`,
                        backgroundRepeat: "no-repeat",
                        backgroundColor: (t) =>
                            t.palette.mode === "light"
                                ? t.palette.grey[50]
                                : t.palette.grey[900],
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                <Grid
                    item
                    xs={12}
                    sm={8}
                    md={5}
                    component={Paper}
                    elevation={6}
                    square
                >
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Se connecter
                        </Typography>
                        <Box
                            component="form"
                            noValidate
                            onSubmit={handleSubmit}
                            sx={{ mt: 1 }}
                        >
                            <TextField
                                error={error !== undefined}
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Nom d'utilisateur"
                                name="username"
                                autoComplete="username"
                                autoFocus
                            />
                            <TextField
                                error={error !== undefined}
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Mot de passe"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Se connecter
                            </Button>

                            {error ? (
                                <Alert sx={{ mb: 2 }} severity="error">
                                    {error}
                                </Alert>
                            ) : null}

                            <Grid container>
                                <Grid item>
                                    <Link to="/Inscription" variant="body2">
                                        {
                                            "Vous n'avez pas encore de compte ? Créez-en un dès maintenant"
                                        }
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
