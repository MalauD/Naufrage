use crate::{
    paypal::{get_paypal, PaypalClientToken},
    tools::OrderError,
};
use actix_web::{web, HttpResponse};
use serde_json::json;

type OrderResponse = Result<HttpResponse, OrderError>;

pub fn config_order(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/Order").route("/ClientToken", web::get().to(get_client_token)));
}

pub async fn get_client_token() -> OrderResponse {
    let paypal = get_paypal(None).await;
    let PaypalClientToken(tok) = paypal.get_client_token().await?;

    Ok(HttpResponse::Ok().json(json!({ "client_token": tok })))
}
