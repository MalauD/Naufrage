import { Grid, LinearProgress, Paper, Typography } from "@mui/material";
import {
    PayPalHostedField,
    PayPalHostedFieldsProvider,
    PayPalScriptProvider,
    usePayPalHostedFields,
    usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import axios from "axios";
import * as React from "react";
import DashboardContent from "../Components/Dashboard";
import Title from "../Components/Title";

const SubmitPayment = () => {
    // Here declare the variable containing the hostedField instance
    const hostedFields = usePayPalHostedFields();

    const submitHandler = () => {
        if (!typeof hostedFields.submit !== "function") return; // validate that `submit()` exists before using it
        hostedFields
            .submit({
                // The full name as shown in the card and billing address
                cardholderName: "John Wick",
            })
            .then((order) => {
                fetch(
                    "/your-server-side-integration-endpoint/capture-payment-info"
                )
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

export default function Checkout() {
    const [data_client_token, setClientToken] = React.useState(undefined);

    React.useEffect(() => {
        axios.get("/Order/ClientToken").then((res) => {
            setClientToken(res.data.client_token);
        });
    }, []);

    return (
        <DashboardContent currentStep={1}>
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
                    {data_client_token ? (
                        <PayPalScriptProvider
                            options={{
                                "client-id":
                                    "AWxcsaQgJcsp2GZpwfOQnKvm7wx93hmIMeAGty8L-Qjz2bu9LLAOUPkx0VWdXjpLgKDX_p-nBxxAV6Bn",
                                "data-client-token": data_client_token,
                                components: "hosted-fields",
                            }}
                        >
                            <CheckoutField />
                        </PayPalScriptProvider>
                    ) : (
                        <LinearProgress />
                    )}
                </Paper>
            </Grid>
        </DashboardContent>
    );
}
function CheckoutField() {
    const [{ isPending }] = usePayPalScriptReducer();
    if (isPending) {
        return <LinearProgress />;
    }
    return (
        <PayPalHostedFieldsProvider
            createOrder={() => {
                // Here define the call to create and order
                return fetch("/your-server-side-integration-endpoint/orders")
                    .then((response) => response.json())
                    .then((order) => order.id)
                    .catch((err) => {
                        // Handle any error
                    });
            }}
            notEligibleError={<h1>Not eligible !</h1>}
        >
            <PayPalHostedField
                id="card-number"
                hostedFieldType="number"
                options={{ selector: "#card-number" }}
            />
            <PayPalHostedField
                id="cvv"
                hostedFieldType="cvv"
                options={{ selector: "#cvv" }}
            />
            <PayPalHostedField
                id="expiration-date"
                hostedFieldType="expirationDate"
                options={{
                    selector: "#expiration-date",
                    placeholder: "MM/YY",
                }}
            />
            <SubmitPayment />
        </PayPalHostedFieldsProvider>
    );
}
