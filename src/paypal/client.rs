use base64::encode;
use chrono::{DateTime, Utc};
use log::info;
use once_cell::sync::OnceCell;
use reqwest::{Client, Result};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tokio::sync::Mutex;

pub enum PaypalEndpoints {
    Live,
    Sandbox,
}

pub struct PaypalClient {
    http_client: Client,
    base_url: String,
    client_id: String,
    app_secret: String,
}

pub struct PaypalClientConfig {
    pub mode: PaypalEndpoints,
    pub client_id: String,
    pub app_secret: String,
}

impl PaypalClientConfig {
    pub fn new(mode: PaypalEndpoints, client_id: String, app_secret: String) -> Self {
        Self {
            mode,
            client_id,
            app_secret,
        }
    }
}

static PAYPAL: OnceCell<PaypalClient> = OnceCell::new();
static PAYPAL_INITIALIZED: OnceCell<Mutex<bool>> = OnceCell::new();

pub async fn get_paypal(config: Option<PaypalClientConfig>) -> &'static PaypalClient {
    if let Some(c) = PAYPAL.get() {
        return c;
    }

    let initializing_mutex = PAYPAL_INITIALIZED.get_or_init(|| tokio::sync::Mutex::new(false));

    let mut initialized = initializing_mutex.lock().await;

    if !*initialized {
        let client = PaypalClient::new(config.unwrap());
        info!(target:"Naufrage","Initialized paypal client");
        if PAYPAL.set(client).is_ok() {
            *initialized = true;
        }
    }

    drop(initialized);
    PAYPAL.get().unwrap()
}

#[derive(Deserialize, Serialize)]
struct AccessTokenReponse {
    access_token: String,
}

#[derive(Deserialize, Serialize)]
struct ClientTokenReponse {
    client_token: String,
}

struct PaypalAccesToken(String);

pub struct PaypalClientToken(pub String);

#[derive(Deserialize, Serialize)]
pub struct PaypalAmount {
    pub value: String,
    pub currency_code: String,
}

impl PaypalAmount {
    pub fn new(value: String, currency_code: String) -> Self {
        Self {
            value,
            currency_code,
        }
    }
}

#[derive(Deserialize, Serialize, Clone)]
pub struct PaypalOrder {
    pub create_time: Option<DateTime<Utc>>,
    pub id: String,
    pub status: String,
}

#[derive(Deserialize, Serialize)]
pub struct PaypalOrderId(pub String);

#[derive(Deserialize, Serialize, Clone)]
pub struct PaypalCaptureData {
    pub create_time: Option<DateTime<Utc>>,
    pub id: String,
    pub status: String,
    pub update_time: Option<DateTime<Utc>>,
    pub payer: PaypalPayer,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct PaypalPayer {
    pub payer_id: String,
}

impl PaypalClient {
    pub fn new(config: PaypalClientConfig) -> Self {
        let base_url = match config.mode {
            PaypalEndpoints::Live => "https://api.paypal.com",
            PaypalEndpoints::Sandbox => "https://api.sandbox.paypal.com",
        };
        Self {
            http_client: Client::new(),
            base_url: base_url.to_string(),
            client_id: config.client_id,
            app_secret: config.app_secret,
        }
    }

    fn get_relative_url(&self, rel_url: &str) -> String {
        format!("{}{}", self.base_url, rel_url)
    }

    async fn generate_acces_token(&self) -> Result<PaypalAccesToken> {
        let auth = format!("{}:{}", self.client_id, self.app_secret);

        let resp: AccessTokenReponse = self
            .http_client
            .post(self.get_relative_url("/v1/oauth2/token"))
            .body("grant_type=client_credentials")
            .header("Authorization", format!("Basic {}", encode(auth)))
            .send()
            .await?
            .json()
            .await?;

        Ok(PaypalAccesToken(resp.access_token))
    }

    pub async fn get_client_token(&self) -> Result<PaypalClientToken> {
        let PaypalAccesToken(access_token) = self.generate_acces_token().await?;

        let resp: ClientTokenReponse = self
            .http_client
            .post(self.get_relative_url("/v1/identity/generate-token"))
            .header("Authorization", format!("Bearer {}", access_token))
            .header("Accept-Language", "en_US")
            .header("Content-Type", "application/json")
            .send()
            .await?
            .json()
            .await?;

        Ok(PaypalClientToken(resp.client_token))
    }

    pub async fn create_order(&self, order: PaypalAmount) -> Result<PaypalOrder> {
        let PaypalAccesToken(access_token) = self.generate_acces_token().await?;

        let body = json!({
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": order
            }]
        });

        let resp = self
            .http_client
            .post(self.get_relative_url("/v2/checkout/orders"))
            .header("Authorization", format!("Bearer {}", access_token))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await?
            .json()
            .await?;

        Ok(resp)
    }

    pub async fn capture_payment(&self, order_id: PaypalOrderId) -> Result<PaypalCaptureData> {
        let PaypalAccesToken(access_token) = self.generate_acces_token().await?;
        let PaypalOrderId(order) = order_id;

        let resp: PaypalCaptureData = self
            .http_client
            .post(self.get_relative_url(&format!("/v2/checkout/orders/{}/capture", order)))
            .header("Authorization", format!("Bearer {}", access_token))
            .header("Content-Type", "application/json")
            .send()
            .await?
            .json()
            .await?;

        Ok(resp)
    }
}
