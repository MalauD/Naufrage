use bson::oid::ObjectId;
use serde::{Deserialize, Serialize, Serializer};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Dose {
    #[serde(
        rename = "_id",
        skip_serializing_if = "Option::is_none",
        serialize_with = "serialize_option_oid_hex"
    )]
    id: Option<ObjectId>,
    user: ObjectId,
    device_id: u32,
    dose_taken: u32,
}

impl Dose {
    pub fn new(user: ObjectId, device_id: u32, dose_taken: u32) -> Self {
        Self {
            id: None,
            user,
            device_id,
            dose_taken,
        }
    }
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
