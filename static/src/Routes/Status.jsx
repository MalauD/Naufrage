import {
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import * as React from "react";
import DashboardContent from "../Components/Dashboard";
import Title from "../Components/Title";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";

function StatusTable({ user }) {
    const rows = [
        {
            name: "Enregistrement de la carte de lycée",
            status: user.barcode_card_id !== undefined,
        },
        { name: "Paiment de l'entrée", status: user.has_paid },
        {
            name: "Vérification du compte par les organisateurs",
            status: user.verified !== undefined,
        },
    ];

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Tâche</TableCell>
                        <TableCell align="right">Avancement</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.name}
                            sx={{
                                "&:last-child td, &:last-child th": {
                                    border: 0,
                                },
                            }}
                        >
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell align="right">
                                {row.status ? (
                                    <DoneIcon color="success" />
                                ) : (
                                    <CloseIcon color="error" />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function Status({ user }) {
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
                <Title>Statut</Title>
                <StatusTable user={user} />
            </Paper>
        </Grid>
    );
}

export default function StatusDashboard() {
    return (
        <DashboardContent currentStep={2}>
            <Status />
        </DashboardContent>
    );
}
