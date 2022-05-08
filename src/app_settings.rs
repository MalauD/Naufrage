use serde::Deserialize;

use crate::paypal::PaypalEndpoints;

fn default_max_dose() -> u32 {
    2
}

#[derive(Deserialize, Debug, Clone)]

pub struct AppSettings {
    #[serde(default = "default_max_dose")]
    pub max_dose: u32,
    pub paypal_client_id: String,
    pub paypal_app_secret: String,
    pub paypal_production: bool,
    pub db_url: String,
    pub db_name: String,
    pub entry_cost: String,
    pub port: u16,
    pub cert: String,
    pub key: String,
    pub token_secret: String,
}

impl AppSettings {
    pub fn get_paypal_mode(&self) -> PaypalEndpoints {
        if self.paypal_production {
            PaypalEndpoints::Live
        } else {
            PaypalEndpoints::Sandbox
        }
    }
}
