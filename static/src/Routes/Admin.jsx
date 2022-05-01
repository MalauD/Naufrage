import { Grid, Paper } from "@mui/material";
import * as React from "react";
import DashboardContent from "../Components/Dashboard";
import Title from "../Components/Title";
import DataGrid, { SelectCellFormatter } from "react-data-grid";
import axios from "axios";

function rowKeyGetter(row) {
    return row._id;
}

function TimestampFormatter({ date }) {
    return (
        <>
            {new Date(parseInt(date.$date.$numberLong)).toLocaleDateString(
                "fr-FR"
            )}
        </>
    );
}

const columns = [
    {
        key: "_id",
        name: "ID",
    },
    {
        key: "username",
        name: "Utilisateur",
    },
    {
        key: "first_name",
        name: "Prénom",
    },
    {
        key: "last_name",
        name: "Nom",
    },
    {
        key: "birth_date",
        name: "Date de naissance",
        formatter(props) {
            return <TimestampFormatter date={props.row.birth_date} />;
        },
    },
    {
        key: "barcode_card_id",
        name: "Code barre",
    },
    {
        key: "has_paid",
        name: "Payé",
        width: 80,
        formatter({ row, onRowChange, isCellSelected }) {
            return <SelectCellFormatter value={row.has_paid} />;
        },
    },
    {
        key: "verified",
        name: "Vérifié",
        width: 80,
        formatter({ row, onRowChange, isCellSelected }) {
            return (
                <SelectCellFormatter
                    value={row.verified}
                    onChange={() => {
                        axios
                            .post(`/Admin/User/${row._id}/Verify`, {
                                is_verified: !row.verified,
                            })
                            .then((res) => {
                                onRowChange({
                                    ...row,
                                    verified: !row.verified,
                                });
                            });
                    }}
                    isCellSelected={isCellSelected}
                />
            );
        },
    },
];

function isAtBottom({ currentTarget }) {
    return (
        currentTarget.scrollTop + 10 >=
        currentTarget.scrollHeight - currentTarget.clientHeight
    );
}

function getRowAtPage(page) {
    return axios
        .get(`/Admin/Users/All?page=${page}&maxResults=${100}`)
        .then((res) => res.data);
}

function Admin({ user }) {
    const [page, setPage] = React.useState(0);
    const [rows, setRows] = React.useState([]);

    React.useEffect(() => {
        getRowAtPage(page).then((rows) => {
            setRows(rows);
            setPage(page + 1);
        });
    }, []);

    async function handleScroll(event) {
        if (!isAtBottom(event)) return;

        getRowAtPage(page).then((newRows) => {
            setPage(page + 1);
            setRows([...rows, ...newRows]);
        });
    }

    return (
        <Grid item xs={12} md={12} lg={12}>
            <Paper
                sx={{
                    p: 2,
                    pb: 2,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Title>Admin</Title>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    rowKeyGetter={rowKeyGetter}
                    onRowsChange={setRows}
                    rowHeight={30}
                    onScroll={handleScroll}
                    className="fill-grid"
                />
            </Paper>
        </Grid>
    );
}

export default function AdminDashboard() {
    return (
        <DashboardContent noAdvance>
            <Admin />
        </DashboardContent>
    );
}
