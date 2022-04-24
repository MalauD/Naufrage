import React from "react";
import PropTypes from "prop-types";
import { Navigate, Route } from "react-router-dom";
import Axios from "axios";

class ProtectedRoute extends React.Component {
    static propTypes = {
        component: PropTypes.elementType.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            gotResult: false,
            connected: false,
        };
    }

    componentDidMount() {
        this.requestMyAccount();
    }

    requestMyAccount = () => {
        Axios.get("/User/Me")
            .then((res) => {
                if (res.data.Account) {
                    this.setState({ connected: true, gotResult: true });
                } else {
                    this.setState({ gotResult: true });
                }
            })
            .catch(() => this.setState({ gotResult: true }));
    };

    render() {
        const { component: Component, ...props } = this.props;
        const { gotResult, connected } = this.state;

        return (
            <div>
                {connected ? (
                    <Component {...props} />
                ) : gotResult ? (
                    <Navigate to="/Login" replace />
                ) : (
                    <div />
                )}
            </div>
        );
    }
}

export default ProtectedRoute;
