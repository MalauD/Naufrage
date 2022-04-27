use actix_web::{http::StatusCode, HttpResponse, HttpResponseBuilder, ResponseError};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum UserError {
    #[error("MismatchingCredential: cannot login")]
    MismatchingCredential,
    #[error("DatabaseError: something went wrong with mongodb")]
    DatabaseError(#[from] mongodb::error::Error),
    #[error("NotFound")]
    NotFound,
}

impl ResponseError for UserError {
    fn status_code(&self) -> StatusCode {
        match *self {
            UserError::MismatchingCredential => StatusCode::UNAUTHORIZED,
            UserError::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
            UserError::NotFound => StatusCode::NOT_FOUND,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponseBuilder::new(self.status_code()).finish()
    }
}

#[derive(Error, Debug)]
pub enum DoseError {
    #[error("Unauthorized")]
    Unauthorized,
    #[error("DatabaseError: something went wrong with mongodb")]
    DatabaseError(#[from] mongodb::error::Error),
}

impl ResponseError for DoseError {
    fn status_code(&self) -> StatusCode {
        match *self {
            Self::Unauthorized => StatusCode::UNAUTHORIZED,
            Self::DatabaseError(_) => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }

    fn error_response(&self) -> HttpResponse {
        HttpResponseBuilder::new(self.status_code()).finish()
    }
}
