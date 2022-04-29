use bson::oid::ObjectId;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::paypal::{PaypalCaptureData, PaypalOrder};

#[derive(Serialize, Deserialize, Clone)]
pub struct Order {
    #[serde(rename = "_id")]
    id: String,
    user: ObjectId,
    #[serde(skip_serializing_if = "Option::is_none")]
    create_time: Option<DateTime<Utc>>,
    status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    update_time: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    payer_id: Option<String>,
}

impl Order {
    pub fn from_capture_data(user: ObjectId, order: PaypalCaptureData) -> Self {
        Self {
            id: order.id,
            user,
            create_time: order.create_time,
            status: order.status,
            update_time: order.update_time,
            payer_id: Some(order.payer.payer_id),
        }
    }

    pub fn new(user: ObjectId, order: PaypalOrder) -> Self {
        Self {
            id: order.id,
            user,
            create_time: order.create_time,
            status: order.status,
            update_time: None,
            payer_id: None,
        }
    }

    /// Get a reference to the order's id.
    pub fn id(&self) -> &str {
        self.id.as_ref()
    }

    /// Get a reference to the order's status.
    pub fn status(&self) -> &str {
        self.status.as_ref()
    }

    /// Get the order's update time.
    pub fn update_time(&self) -> Option<DateTime<Utc>> {
        self.update_time
    }

    /// Get a reference to the order's payer id.
    pub fn payer_id(&self) -> Option<&String> {
        self.payer_id.as_ref()
    }
}
