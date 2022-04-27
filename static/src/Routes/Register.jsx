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
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import frLocale from "date-fns/locale/fr";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import axios from "axios";

const theme = createTheme();

const groups = [
    "BC1",
    "BC2",
    "ECG1",
    "ECG2",
    "ECG3",
    "ECE",
    "ECS1",
    "ECS2",
    "HKAL1",
    "HKAL2",
    "HKBK",
    "KAL1",
    "KAL2",
    "KBL",
    "MP1",
    "MP2",
    "MP2I",
    "MP3",
    "MPSI1",
    "MPSI2",
    "PC1",
    "PC2",
    "PCSI1",
    "PCSI2",
    "PSI1",
    "PSI2",
].sort();

export default function Register() {
    const [BirthDate, setBirthDate] = React.useState(new Date(2003, 7, 21));
    const [group, groupChange] = React.useState("MP2I");
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        axios
            .post("/User/Register", {
                username: data.get("username"),
                first_name: data.get("first_name"),
                last_name: data.get("last_name"),
                birth_date: BirthDate.getTime(),
                group: group,
                password: data.get("password"),
            })
            .then((res) => {
                if (res.data.success) {
                    navigate("/");
                }
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
                            mx: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Inscription
                        </Typography>
                        <Box
                            component="form"
                            noValidate
                            onSubmit={handleSubmit}
                            sx={{ mt: 1 }}
                        >
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Nom d'utilisateur"
                                name="username"
                                autoComplete="username"
                                autoFocus
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="first_name"
                                        label="Prénom"
                                        name="first_name"
                                        autoComplete="first_name"
                                        autoFocus
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="last_name"
                                        label="Nom"
                                        name="last_name"
                                        autoComplete="last_name"
                                        autoFocus
                                    />
                                </Grid>
                                <Grid item xs={4}>
                                    <LocalizationProvider
                                        locale={frLocale}
                                        dateAdapter={AdapterDateFns}
                                    >
                                        <DatePicker
                                            label="Date de naissance"
                                            value={BirthDate}
                                            onChange={(newValue) => {
                                                setBirthDate(newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} />
                                            )}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                                <Grid item xs={8}>
                                    <FormControl fullWidth>
                                        <InputLabel id="group-label">
                                            Classe
                                        </InputLabel>
                                        <Select
                                            labelId="group-label"
                                            id="group-select"
                                            value={group}
                                            label="Groupe"
                                            onChange={(g) =>
                                                groupChange(g.target.value)
                                            }
                                        >
                                            {groups.map((g) => (
                                                <MenuItem value={g}>
                                                    {g}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <TextField
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
                            <Grid container>
                                <Grid item>
                                    <Link to="/Connexion" variant="body2">
                                        {
                                            "Vous n'avez pas encore de compte ? Faites en un dès maintenant"
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
