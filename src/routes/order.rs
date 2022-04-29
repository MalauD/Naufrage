use crate::{
    db::get_mongo,
    models::{Order, User},
    paypal::{get_paypal, PaypalAmount, PaypalClientToken, PaypalOrderId},
    tools::OrderError,
};
use actix_web::{web, HttpResponse};
use log::debug;
use serde_json::json;

type OrderResponse = Result<HttpResponse, OrderError>;

pub fn config_order(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/Order")
            .route("/ClientToken", web::get().to(get_client_token))
            .route("/Create", web::post().to(create_order))
            .route("/Capture/{order_id}", web::post().to(capture_order)),
    );
}

pub async fn get_client_token() -> OrderResponse {
    let paypal = get_paypal(None).await;
    let PaypalClientToken(tok) = paypal.get_client_token().await?;

    Ok(HttpResponse::Ok().json(json!({ "client_token": tok })))
}

pub async fn create_order(user: User) -> OrderResponse {
    let db = get_mongo().await;
    let paypal = get_paypal(None).await;

    let order = paypal
        .create_order(PaypalAmount::new("10.00".to_string(), "EUR".to_string()))
        .await?;

    let db_order = Order::new(user.id().unwrap(), order.clone());

    db.save_order(&db_order).await?;
    db.add_order(&user, &db_order).await?;

    Ok(HttpResponse::Ok().json(order))
}

pub async fn capture_order(user: User, path: web::Path<String>) -> OrderResponse {
    let order_id = PaypalOrderId(path.into_inner());

    let db = get_mongo().await;
    let paypal = get_paypal(None).await;

    let order = paypal.capture_payment(order_id).await?;

    let db_order = Order::from_capture_data(user.id().unwrap(), order.clone());

    db.update_order(&db_order).await?;
    if db_order.status() == "COMPLETED" {
        db.change_paid_state(&user, true).await?;
        debug!("User has completed payment");
    }

    Ok(HttpResponse::Ok().json(order))
}
