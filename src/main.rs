use actix_files::{Files, NamedFile};
use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_web::{
    web::{self, Data},
    App, HttpRequest, HttpServer, Result,
};
use config::{Config, File, FileFormat};
use log::info;
use routes::config_user;
use std::{fs, sync::RwLock};

use crate::{models::Sessions, routes::config_dose};

mod app_settings;
mod db;
mod models;
mod routes;
mod tools;

async fn index(_req: HttpRequest) -> Result<NamedFile> {
    Ok(NamedFile::open("./static/dist/index.html")?)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    info!(target:"Naufrage::main","Starting Naufrage");
    const PORT: i32 = 8080;
    let sessions: Data<RwLock<Sessions>> = Data::new(RwLock::new(Default::default()));
    let mut builder = Config::builder();
    builder = builder.set_default("max_dose", 2 as u64).unwrap();
    builder = builder.add_source(File::new("Settings.toml", FileFormat::Toml));
    let settings = builder.build().unwrap();

    HttpServer::new(move || {
        App::new()
            .app_data(sessions.clone())
            .app_data(Data::new(app_settings::AppSettings::new(
                settings.get_int("max_dose").unwrap() as u32,
            )))
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&[0; 32])
                    .name("naufrage-id")
                    .secure(false),
            ))
            .route("/", web::get().to(index))
            .configure(config_user)
            .configure(config_dose)
            .service(Files::new("/", "./static/dist/"))
    })
    .bind(format!("0.0.0.0:{}", PORT))?
    .run()
    .await
}
