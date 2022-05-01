import {
    Avatar,
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Fab,
    Grid,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import * as React from "react";
import DashboardContent from "../Components/Dashboard";
import Title from "../Components/Title";
import { useNavigate } from "react-router-dom";

function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
    };
}

function UserProfile({ user }) {
    const navigate = useNavigate();

    return (
        <Grid item xs={12} md={8} lg={9}>
            <Paper
                sx={{
                    p: 2,
                    pb: 2,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Title>Profile</Title>
                <Card>
                    <CardHeader
                        avatar={
                            <Avatar
                                {...stringAvatar(
                                    `${user.first_name} ${user.last_name}`
                                )}
                            />
                        }
                        title={`${user.username}`}
                        subheader={`${user.first_name} ${user.last_name}`}
                    />
                    <CardContent>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            Classe: {user.group}
                            <br />
                            Date de naissance:{" "}
                            {new Date(
                                parseInt(user.birth_date.$date.$numberLong)
                            ).toLocaleDateString("fr-FR")}
                            <br />
                            Code barre: {user.barcode_card_id || "Aucun"}
                        </Typography>
                        <Stack spacing={1} direction="row">
                            {user.has_paid ? (
                                <Chip
                                    variant="outlined"
                                    label="Payé"
                                    color="success"
                                />
                            ) : (
                                <Chip
                                    variant="outlined"
                                    label="Non payé"
                                    color="error"
                                />
                            )}
                            {user.verified ? (
                                <Chip
                                    variant="outlined"
                                    label="Vérifié"
                                    color="success"
                                />
                            ) : (
                                <Chip
                                    variant="outlined"
                                    label="Non vérifié"
                                    color="warning"
                                />
                            )}
                            {user.admin ? (
                                <Chip
                                    variant="outlined"
                                    label="Admin"
                                    color="primary"
                                />
                            ) : null}
                        </Stack>
                    </CardContent>
                </Card>
                {user.barcode_card_id === undefined ||
                user.has_paid === false ? (
                    <Fab
                        variant="extended"
                        size="small"
                        color="primary"
                        aria-label="add"
                        onClick={() => navigate("/")}
                        sx={{ mt: 2, mb: 1, width: 250, mx: "auto" }}
                    >
                        Compléter son inscription
                    </Fab>
                ) : null}
                {user.admin ? (
                    <Fab
                        variant="extended"
                        size="small"
                        color="primary"
                        aria-label="add"
                        onClick={() => navigate("/Admin")}
                        sx={{ my: 1, width: 250, mx: "auto" }}
                    >
                        Admin
                    </Fab>
                ) : null}
            </Paper>
        </Grid>
    );
}

export default function UserProfileDashboard() {
    return (
        <DashboardContent noAdvance>
            <UserProfile />
        </DashboardContent>
    );
}
