use crate::{
    db::{get_mongo, PaginationOptions},
    models::{Sessions, User, UserInfoLogin, UserInfoRegister},
    tools::UserError,
};
use actix_identity::Identity;
use actix_web::{web, HttpResponse, Responder};
use bson::oid::ObjectId;
use serde::Deserialize;
use serde_json::json;
use std::sync::RwLock;

type AdminResponse = Result<HttpResponse, UserError>;

pub fn config_admin(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/Admin")
            .route("/Users/NonVerified", web::get().to(get_non_verified))
            .route("/Users/All", web::get().to(get_all_users))
            .route("/User/{id}/Verify", web::post().to(verify_user)),
    );
}

pub async fn get_non_verified(
    user: User,
    pagination: web::Query<PaginationOptions>,
) -> AdminResponse {
    let db = get_mongo(None).await;
    let user = db.get_user(&user.id().unwrap()).await.unwrap().unwrap();

    if user.is_admin() {
        let users = db.get_non_verified_users(pagination.into_inner()).await?;
        Ok(HttpResponse::Ok().json(json!(users)))
    } else {
        Ok(HttpResponse::Unauthorized().finish())
    }
}

pub async fn get_all_users(user: User, pagination: web::Query<PaginationOptions>) -> AdminResponse {
    let db = get_mongo(None).await;
    let user = db.get_user(&user.id().unwrap()).await.unwrap().unwrap();

    if user.is_admin() {
        let users = db.get_all_users(pagination.into_inner()).await?;
        Ok(HttpResponse::Ok().json(json!(users)))
    } else {
        Ok(HttpResponse::Unauthorized().finish())
    }
}

#[derive(Deserialize)]
struct VerifyUser {
    is_verified: bool,
}

async fn verify_user(
    user: User,
    id: web::Path<String>,
    verified: web::Json<VerifyUser>,
) -> AdminResponse {
    let db = get_mongo(None).await;
    if user.is_admin() {
        let user_to_modify = db
            .get_user(&ObjectId::parse_str(id.into_inner()).unwrap())
            .await?
            .unwrap();
        db.verify_user(&user_to_modify, verified.is_verified)
            .await?;
        Ok(HttpResponse::Ok().finish())
    } else {
        Ok(HttpResponse::Unauthorized().finish())
    }
}
