import {
    Badge,
    Card,
    CardContent,
    CardMedia,
    Grid,
    LinearProgress,
    Paper,
    Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import {
    PayPalButtons,
    PayPalHostedField,
    PayPalHostedFieldsProvider,
    PayPalScriptProvider,
    usePayPalHostedFields,
    usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import axios from "axios";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import DashboardContent from "../Components/Dashboard";
import Title from "../Components/Title";
import Concert from "./../img/concert.jpg";

const SubmitPayment = () => {
    // Here declare the variable containing the hostedField instance
    const hostedFields = usePayPalHostedFields();

    const submitHandler = () => {
        if (!typeof hostedFields.submit !== "function") return; // validate that `submit()` exists before using it
        hostedFields
            .submit({
                // The full name as shown in the card and billing address
                cardholderName: "Malaury Dutour",
            })
            .then((order) => {
                fetch("/Order/Capture")
                    .then((response) => response.json())
                    .then((data) => {
                        // Inside the data you can find all the information related to the payment
                    })
                    .catch((err) => {
                        // Handle any error
                    });
            });
    };

    return <button onClick={submitHandler}>Pay</button>;
};

function ProductCard({ has_paid }) {
    return (
        <Card sx={{ display: "flex", m: 2 }}>
            <CardMedia
                component="img"
                sx={{ width: 151 }}
                image={Concert}
                alt="Bal"
            />

            <Box sx={{ display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: "1 0 auto" }}>
                    {has_paid ? (
                        <Badge badgeContent={"Payé"} color="success">
                            <Typography component="div" variant="h5">
                                Entrée au bal des prépas 2022
                            </Typography>
                        </Badge>
                    ) : (
                        <Typography component="div" variant="h5">
                            Entrée au bal des prépas 2022
                        </Typography>
                    )}

                    <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        component="div"
                    >
                        Prix: 10€
                    </Typography>
                </CardContent>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        pl: 1,
                        pb: 1,
                    }}
                ></Box>
            </Box>
        </Card>
    );
}

function Checkout({ user }) {
    const [data_client_token, setClientToken] = React.useState(undefined);

    React.useEffect(() => {
        if (!user.has_paid)
            axios.get("/Order/ClientToken").then((res) => {
                setClientToken(res.data.client_token);
            });
    }, []);

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
                <Title>Paiement</Title>
                <ProductCard has_paid={user.has_paid} />

                {!user.has_paid ? (
                    <Grid container>
                        <Grid item xs={12} style={{ textAlign: "center" }}>
                            {data_client_token ? (
                                <PayPalScriptProvider
                                    options={{
                                        "client-id":
                                            "AWxcsaQgJcsp2GZpwfOQnKvm7wx93hmIMeAGty8L-Qjz2bu9LLAOUPkx0VWdXjpLgKDX_p-nBxxAV6Bn",
                                        "data-client-token": data_client_token,
                                        components: "hosted-fields,buttons",
                                        currency: "EUR",
                                    }}
                                >
                                    <CheckoutField />
                                </PayPalScriptProvider>
                            ) : (
                                <LinearProgress />
                            )}
                        </Grid>
                    </Grid>
                ) : null}
            </Paper>
        </Grid>
    );
}
function CheckoutField() {
    const navigate = useNavigate();
    const [{ isPending }] = usePayPalScriptReducer();
    if (isPending) {
        return <LinearProgress />;
    }
    return (
        <PayPalButtons
            sx={{ p: 2 }}
            disabled={false}
            fundingSource={undefined}
            createOrder={(data, actions) => {
                return axios.post("/Order/Create").then((res) => res.data.id);
            }}
            onApprove={(data, actions) => {
                barcode_card_id;
                return axios
                    .post(`/Order/Capture/${data.orderID}`)
                    .then((res) => {
                        navigate("/Status");
                    });
            }}
        />
    );
}

export default function CheckoutDashBoard() {
    return (
        <DashboardContent currentStep={1}>
            <Checkout />
        </DashboardContent>
    );
}
