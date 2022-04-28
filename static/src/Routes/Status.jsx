import { Grid, Paper, Typography } from "@mui/material";
import * as React from "react";
import DashboardContent from "../Components/Dashboard";
import Title from "../Components/Title";

export default function Status() {
    return (
        <DashboardContent currentStep={2}>
            <Grid item xs={12} md={8} lg={9}>
                <Paper
                    sx={{
                        p: 2,
                        pb: 2,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <Title>Status</Title>
                </Paper>
            </Grid>
        </DashboardContent>
    );
}
