import * as React from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MuiDrawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Title from "./Title";
import { IconButton, Step, StepButton, Stepper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LogoutIcon from "@mui/icons-material/Logout";
import FaceIcon from "@mui/icons-material/Face";

const drawerWidth = 240;

const steps = [
    "Enregistrer sa carte de lycée",
    "Paiement",
    "Vérification du compte",
];

const steps_url = ["/Carte", "/Paiment", "/Statut"];

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    "& .MuiDrawer-paper": {
        position: "relative",
        whiteSpace: "nowrap",
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: "border-box",
        ...(!open && {
            overflowX: "hidden",
            transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up("sm")]: {
                width: theme.spacing(9),
            },
        }),
    },
}));

const mdTheme = createTheme();

export default function DashboardContent(props) {
    const [open, setOpen] = React.useState(false);
    const [user, setUser] = React.useState(undefined);
    const navigate = useNavigate();
    const toggleDrawer = () => {
        setOpen(!open);
    };

    const { currentStep, children, noAdvance } = props;

    React.useEffect(() => {
        axios.get("/User/Me").then((res) => setUser(res.data.Account));
    }, []);

    const childrenWithProps = user
        ? React.Children.map(children, (child) => {
              // Checking isValidElement is the safe way and avoids a typescript
              // error too.
              if (React.isValidElement(child)) {
                  return React.cloneElement(child, { user });
              }
              return child;
          })
        : [];

    const onStepClick = (index) => {
        navigate(steps_url[index]);
    };

    const getCompleted = () => {
        const completed = [false, false, false];
        if (user) {
            if (user.barcode_card_id) {
                completed[0] = true;
            }
            if (user.has_paid) {
                completed[1] = true;
            }
        }
        return completed;
    };

    const logout = () => {
        axios.post("/User/Logout").then(() => window.location.replace("/"));
    };
    return (
        <ThemeProvider theme={mdTheme}>
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <AppBar position="absolute" open={open}>
                    <Toolbar
                        sx={{
                            pr: "24px", // keep right padding when drawer closed
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h4"
                            color="inherit"
                            onClick={() => navigate("/")}
                            sx={{
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                flexGrow: 1,
                                fontFamily: "Pacifico, cursive",
                                cursor: "pointer",
                                userSelect: "none",
                            }}
                        >
                            Bal des prépas 2022
                        </Typography>
                        <IconButton
                            component="span"
                            color="inherit"
                            onClick={() => navigate("/Profile")}
                        >
                            <FaceIcon />
                        </IconButton>
                        <IconButton
                            component="span"
                            color="inherit"
                            onClick={logout}
                        >
                            <LogoutIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Box
                    component="main"
                    sx={{
                        backgroundColor: (theme) =>
                            theme.palette.mode === "light"
                                ? theme.palette.grey[100]
                                : theme.palette.grey[900],
                        flexGrow: 1,
                        height: "100vh",
                        overflow: "auto",
                    }}
                >
                    <Toolbar />
                    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                        <Grid container spacing={3}>
                            {noAdvance ? null : (
                                <Grid item xs={12} md={8} lg={9}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            pb: 2,
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <Title>
                                            Avancement de l'inscription
                                        </Title>
                                        <Stepper
                                            nonLinear
                                            alternativeLabel
                                            activeStep={currentStep}
                                        >
                                            {steps.map((label, index) => (
                                                <Step
                                                    key={label}
                                                    completed={
                                                        getCompleted()[index]
                                                    }
                                                >
                                                    <StepButton
                                                        color="inherit"
                                                        onClick={() =>
                                                            onStepClick(index)
                                                        }
                                                    >
                                                        {label}
                                                    </StepButton>
                                                </Step>
                                            ))}
                                        </Stepper>
                                    </Paper>
                                </Grid>
                            )}

                            {childrenWithProps}
                        </Grid>
                    </Container>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
