use crate::tools::UserError;
use actix_identity::Identity;
use actix_web::{
    dev::Payload, error::ErrorUnauthorized, web::Data, Error, FromRequest, HttpRequest,
};
use chrono::serde::ts_milliseconds;
use chrono::{DateTime, Utc};
use futures::Future;
use mongodb::bson::oid::ObjectId;
use mongodb::bson::serde_helpers::chrono_datetime_as_bson_datetime;
use ring::{digest, pbkdf2};
use serde::{Deserialize, Serialize, Serializer};
use std::{num::NonZeroU32, pin::Pin, sync::RwLock, u8};

use super::Sessions;

static PBKDF2_ALG: pbkdf2::Algorithm = pbkdf2::PBKDF2_HMAC_SHA256;
const CREDENTIAL_LEN: usize = digest::SHA256_OUTPUT_LEN;
static SALT_COMPONENT: [u8; 16] = [
    0xd6, 0x26, 0x98, 0xda, 0xf4, 0xdc, 0x50, 0x52, 0x24, 0xf2, 0x27, 0xd1, 0xfe, 0x39, 0x01, 0x8a,
];
const PBKDF2_ITER: u32 = 100_000;

#[derive(Deserialize)]
pub struct UserInfoRegister {
    username: String,
    first_name: String,
    last_name: String,
    #[serde(with = "ts_milliseconds")]
    birth_date: DateTime<Utc>,
    group: String,
    password: String,
}

impl UserInfoRegister {
    pub fn get_username(&self) -> String {
        self.username.clone()
    }
}

#[derive(Deserialize)]
pub struct UserInfoLogin {
    username: String,
    password: String,
}

impl UserInfoLogin {
    pub fn get_username(&self) -> String {
        self.username.clone()
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    #[serde(
        rename = "_id",
        skip_serializing_if = "Option::is_none",
        serialize_with = "serialize_option_oid_hex"
    )]
    id: Option<ObjectId>,
    pub username: String,
    first_name: String,
    last_name: String,
    #[serde(with = "chrono_datetime_as_bson_datetime")]
    birth_date: DateTime<Utc>,
    group: String,
    #[serde(with = "serde_bytes")]
    pub credential: Vec<u8>,
    dose_taken: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    rfid_card_id: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    barcode_card_id: Option<i32>,
}

fn serialize_option_oid_hex<S>(x: &Option<ObjectId>, s: S) -> Result<S::Ok, S::Error>
where
    S: Serializer,
{
    match x {
        Some(o) => s.serialize_str(&o.to_hex()),
        None => s.serialize_none(),
    }
}

impl User {
    pub fn login(&self, user: &UserInfoLogin) -> Result<(), UserError> {
        let salt = Self::salt(&user.username);
        let iter = NonZeroU32::new(PBKDF2_ITER).unwrap();
        pbkdf2::verify(
            PBKDF2_ALG,
            iter,
            &salt,
            user.password.as_bytes(),
            &self.credential,
        )
        .map_err(|_| UserError::MismatchingCredential)?;

        Ok(())
    }

    fn salt(username: &str) -> Vec<u8> {
        let mut salt = Vec::with_capacity(SALT_COMPONENT.len() + username.as_bytes().len());
        salt.extend(SALT_COMPONENT.as_ref());
        salt.extend(username.as_bytes());
        salt
    }

    pub fn new(req: &UserInfoRegister) -> Self {
        let salt = Self::salt(&req.username);
        let iter = NonZeroU32::new(PBKDF2_ITER).unwrap();
        let mut cred = [0u8; CREDENTIAL_LEN];
        pbkdf2::derive(PBKDF2_ALG, iter, &salt, req.password.as_bytes(), &mut cred);
        Self {
            id: None,
            username: req.username.clone(),
            credential: cred.to_vec(),
            first_name: req.first_name.clone(),
            last_name: req.last_name.clone(),
            birth_date: req.birth_date.clone(),
            group: req.group.clone(),
            dose_taken: 0,
            rfid_card_id: None,
            barcode_card_id: None,
        }
    }

    pub fn get_username(&self) -> String {
        self.username.clone()
    }

    /// Get a reference to the user's id.
    pub fn id(&self) -> Option<ObjectId> {
        self.id
    }

    /// Set the user's id.
    pub fn set_id(&mut self, id: Option<ObjectId>) {
        self.id = id;
    }

    /// Get the user's dose taken.
    pub fn dose_taken(&self) -> i32 {
        self.dose_taken
    }

    /// Get the user's birth date.
    pub fn birth_date(&self) -> DateTime<Utc> {
        self.birth_date
    }
}

impl FromRequest for User {
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<User, Error>>>>;

    fn from_request(req: &HttpRequest, pl: &mut Payload) -> Self::Future {
        let fut = Identity::from_request(req, pl);
        let sessions: Option<&Data<RwLock<Sessions>>> = req.app_data();
        if sessions.is_none() {
            return Box::pin(async { Err(ErrorUnauthorized("unauthorized")) });
        }
        let sessions = sessions.unwrap().clone();
        Box::pin(async move {
            if let Some(identity) = fut.await?.identity() {
                if let Some(user) = sessions
                    .read()
                    .unwrap()
                    .map
                    .get(&identity)
                    .map(|x| x.clone())
                {
                    return Ok(user);
                }
            };

            Err(ErrorUnauthorized("unauthorized"))
        })
    }
}
