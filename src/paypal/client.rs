use log::info;
use once_cell::sync::OnceCell;
use reqwest::{Client, Result};
use serde::{Deserialize, Serialize};
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

    async fn generate_acces_token(&self) -> Result<PaypalAccesToken> {
        let auth = format!("{}:{}", self.client_id, self.app_secret);
        let resp: AccessTokenReponse = self
            .http_client
            .post("/v1/oauth2/token")
            .body("grant_type=client_credentials")
            .header("Authorization", format!("Basic {}", auth))
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
            .post("/v1/identity/generate-token")
            .header("Authorization", format!("Bearer {}", access_token))
            .header("Accept-Language", "en_US")
            .header("Content-Type", "application/json")
            .send()
            .await?
            .json()
            .await?;

        Ok(PaypalClientToken(resp.client_token))
    }
}
