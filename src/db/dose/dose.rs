use crate::{db::MongoClient, models::Dose};
use bson::oid::ObjectId;
use mongodb::{bson::doc, error::Result};

impl MongoClient {
    pub async fn save_dose(&self, dose: Dose) -> Result<ObjectId> {
        let coll = self._database.collection::<Dose>("Dose");
        let r = coll.insert_one(dose, None).await?;
        Ok(r.inserted_id.as_object_id().unwrap())
    }
}
