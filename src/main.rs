use actix_files::{Files, NamedFile};
use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_web::{
    web::{self, Data},
    App, HttpRequest, HttpServer, Result,
};
use dotenv::dotenv;
use log::info;
use routes::config_user;
use std::{fs, sync::RwLock};

use crate::{
    app_settings::AppSettings,
    db::{get_mongo, MongoConfig},
    models::Sessions,
    paypal::{get_paypal, PaypalClientConfig},
    routes::{config_admin, config_dose, config_order},
};
use openssl::ssl::{SslAcceptor, SslFiletype, SslMethod};

mod app_settings;
mod db;
mod models;
mod paypal;
mod routes;
mod tools;

async fn index(_req: HttpRequest) -> Result<NamedFile> {
    Ok(NamedFile::open("./static/dist/index.html")?)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    env_logger::init();
    info!(target:"Naufrage::main","Starting Naufrage");
    let sessions: Data<RwLock<Sessions>> = Data::new(RwLock::new(Default::default()));

    let config = envy::from_env::<AppSettings>().unwrap();

    let config_paypal = PaypalClientConfig::new(
        config.clone().get_paypal_mode(),
        config.clone().paypal_client_id.to_string(),
        config.clone().paypal_app_secret.to_string(),
    );
    let _ = get_paypal(Some(config_paypal)).await;
    let _ = get_mongo(Some(MongoConfig::new(
        config.clone().db_url,
        config.clone().db_name,
    )))
    .await;

    let mut builder = SslAcceptor::mozilla_intermediate(SslMethod::tls()).unwrap();
    builder
        .set_private_key_file(config.clone().key, SslFiletype::PEM)
        .unwrap();
    builder
        .set_certificate_chain_file(config.clone().cert)
        .unwrap();

    let port = config.clone().port;

    HttpServer::new(move || {
        App::new()
            .app_data(sessions.clone())
            .app_data(Data::new(config.clone()))
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&[0; 32])
                    .name("naufrage-id")
                    .secure(false),
            ))
            .route("/", web::get().to(index))
            .configure(config_user)
            .configure(config_dose)
            .configure(config_order)
            .configure(config_admin)
            .service(Files::new("/", "./static/dist/"))
    })
    .bind_openssl(format!("0.0.0.0:{}", port), builder)?
    .run()
    .await
}
