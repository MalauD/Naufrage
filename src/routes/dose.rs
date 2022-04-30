use crate::{app_settings::AppSettings, db::get_mongo, models::Dose, tools::DoseError};
use actix_web::{web, HttpResponse};
use serde::Deserialize;

type DoseResponse = Result<HttpResponse, DoseError>;

pub fn config_dose(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/Dose").route(
        "/Reduce/{rfid_card_id}/{device_id}",
        web::post().to(reduce_dose),
    ));
}

#[derive(Debug, Deserialize)]
pub struct ReduceDoseQuery {
    token: i32,
}

pub async fn reduce_dose(
    path: web::Path<(i32, u32)>,
    query: web::Query<ReduceDoseQuery>,
    settings: web::Data<AppSettings>,
) -> DoseResponse {
    let db = get_mongo(None).await;
    let (rfid_card_id, device_id) = path.into_inner();

    let (user, is_allowed_to_drink) = db.is_able_to_drink(rfid_card_id, 2).await?;

    let dose_count = settings.max_dose;

    if is_allowed_to_drink {
        let user = user.unwrap();
        db.drink_dose(&user, dose_count).await?;
        db.save_dose(Dose::new(user.id().unwrap(), device_id, dose_count))
            .await?;
        Ok(HttpResponse::Ok().finish())
    } else {
        Ok(HttpResponse::MethodNotAllowed().finish())
    }
}
