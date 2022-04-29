use crate::{db::MongoClient, models::Order};
use mongodb::{bson::doc, error::Result};

impl MongoClient {
    pub async fn save_order(&self, order: &Order) -> Result<String> {
        let coll = self._database.collection::<Order>("Order");
        let r = coll.insert_one(order, None).await?;
        Ok(r.inserted_id.as_str().unwrap().to_string())
    }

    pub async fn update_order(&self, order: &Order) -> Result<()> {
        let coll = self._database.collection::<Order>("Order");
        let r = coll
            .update_one(
                doc! {"_id": order.id()}, 
                doc! {"$set": {"status": order.status(), "update_time": order.update_time(), "payer_id": order.payer_id()}}, 
                None
            )
            .await?;
        Ok(())
    }
}
