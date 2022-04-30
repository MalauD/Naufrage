use crate::{
    db::get_mongo,
    models::{Sessions, User, UserInfoLogin, UserInfoRegister},
    tools::UserError,
};
use actix_identity::Identity;
use actix_web::{web, HttpResponse, Responder};
use serde::Deserialize;
use serde_json::json;
use std::sync::RwLock;

type UserResponse = Result<HttpResponse, UserError>;

pub fn config_user(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/User")
            .route("/Login", web::post().to(login))
            .route("/Register", web::post().to(register))
            .route("/Logout", web::post().to(logout))
            .route("/Me", web::get().to(get_account))
            .route("/Card", web::post().to(set_card)),
    );
}

pub async fn login(
    id: Identity,
    user: web::Json<UserInfoLogin>,
    sessions: web::Data<RwLock<Sessions>>,
) -> UserResponse {
    let db = get_mongo(None).await;
    if let Some(user_mod) = db.get_user_by_username(user.get_username()).await? {
        user_mod.login(&user)?;
        id.remember(user_mod.get_username());
        sessions
            .write()
            .unwrap()
            .map
            .insert(user_mod.get_username(), user_mod);
        Ok(HttpResponse::Ok().json(json!({"success": true})))
    } else {
        Ok(HttpResponse::Forbidden().finish())
    }
}

pub async fn register(
    id: Identity,
    user: web::Json<UserInfoRegister>,
    sessions: web::Data<RwLock<Sessions>>,
) -> UserResponse {
    let db = get_mongo(None).await;
    let user_mod = User::new(&user.0);

    if db.has_user_by_name(&user_mod).await? {
        return Ok(HttpResponse::Ok().json(json!({"success": false})));
    }
    let mut user_saved = user_mod.clone();
    let user_id = db.save_user(user_mod).await?;
    user_saved.set_id(Some(user_id));
    id.remember(user.get_username());
    sessions
        .write()
        .unwrap()
        .map
        .insert(user.get_username(), user_saved.clone());
    Ok(HttpResponse::Ok().json(json!({"success": true})))
}

pub async fn logout(id: Identity) -> UserResponse {
    id.forget();
    Ok(HttpResponse::Ok().finish())
}

pub async fn get_account(user: User) -> impl Responder {
    let db = get_mongo(None).await;
    let u = db.get_user(&user.id().unwrap()).await.unwrap().unwrap();
    web::Json(json!({ "Account": u }))
}

#[derive(Debug, Deserialize)]
pub struct SetCardQuery {
    barcode_id: i32,
}

pub async fn set_card(user: User, query: web::Query<SetCardQuery>) -> UserResponse {
    let db = get_mongo(None).await;
    let barcode_card_id = query.barcode_id;
    db.set_user_barcode(&user, barcode_card_id).await?;
    Ok(HttpResponse::Ok().finish())
}
