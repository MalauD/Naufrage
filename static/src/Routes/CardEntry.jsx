import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import * as React from "react";
import DashboardContent from "../Components/Dashboard";
import Title from "../Components/Title";
import CardImg from "./../img/card.jpg";
import SaveIcon from "@mui/icons-material/Save";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CardEntry({ user }) {
    const [error, setError] = React.useState(undefined);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        if (data.get("barcode").length > 6) {
            setError("Le code barre doit contenir au maximum 6 numéros");
            return;
        }
        const barcode = parseInt(data.get("barcode"));
        axios
            .post(`/User/Card?barcode_id=${barcode}`)
            .then(() => navigate("/Paiment"));
    };

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
                <Title>Enregistrer sa carte de lycée</Title>
                <Card>
                    <CardMedia
                        component="img"
                        image={CardImg}
                        alt="Paella dish"
                    />
                    <CardContent>
                        <Typography variant="body2" color="text.secondary">
                            Le numéro de votre carte de lycée se trouve au dos
                            de celle-ci sous le code barre. Il est composé de
                            six chiffres.
                        </Typography>
                    </CardContent>
                </Card>
                <Alert severity="warning" sx={{ my: 2 }}>
                    Assurez vous d'entrer votre numéro de carte correctement,
                    sinon l'accès au bal vous sera impossible !
                </Alert>
                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <TextField
                        margin="normal"
                        required
                        name="barcode"
                        id="barcode-number"
                        label="Numéro de carte"
                        type="number"
                        fullWidth
                        defaultValue={user.barcode_card_id}
                        error={error !== undefined}
                        helperText={error}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        endIcon={<SaveIcon />}
                    >
                        Soumettre
                    </Button>
                </Box>
            </Paper>
        </Grid>
    );
}

export default function CardEntryDashBoard() {
    return (
        <DashboardContent currentStep={0}>
            <CardEntry />
        </DashboardContent>
    );
}
