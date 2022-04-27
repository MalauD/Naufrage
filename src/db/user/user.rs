use crate::{db::MongoClient, models::User, tools::UserError};
use bson::oid::ObjectId;
use chrono::{Datelike, Utc};
use mongodb::{bson::doc, error::Result};

impl MongoClient {
    pub async fn get_user_by_username(&self, username: String) -> Result<Option<User>> {
        let coll = self._database.collection::<User>("User");
        coll.find_one(doc! {"username": username.clone()}, None)
            .await
    }

    pub async fn get_user(&self, user: &ObjectId) -> Result<Option<User>> {
        let coll = self._database.collection::<User>("User");
        coll.find_one(doc! {"_id": user}, None).await
    }

    pub async fn save_user(&self, user: User) -> Result<ObjectId> {
        let coll = self._database.collection::<User>("User");
        let r = coll.insert_one(user, None).await?;
        Ok(r.inserted_id.as_object_id().unwrap())
    }

    pub async fn has_user_by_name(&self, user: &User) -> Result<bool> {
        let coll = self._database.collection::<User>("User");
        coll.count_documents(doc! {"username": user.get_username()}, None)
            .await
            .map(|c| c != 0)
    }

    pub async fn is_able_to_drink(
        &self,
        rfid_card_id: i32,
        max_dose: u32,
    ) -> Result<(Option<User>, bool)> {
        let coll = self._database.collection::<User>("User");
        let u = coll
            .find_one(doc! {"rfid_card_id": rfid_card_id}, None)
            .await?;
        if let Some(user) = u {
            let today = Utc::now();
            let mut age = today.year() - user.birth_date().year();
            let m = today.month0() as i32 - user.birth_date().month0() as i32;
            if m < 0 || (m == 0 && today < user.birth_date()) {
                age = age - 1;
            }
            if age < 18 {
                Ok((Some(user), false))
            } else {
                Ok((Some(user.clone()), user.dose_taken() + 1 <= max_dose as i32))
            }
        } else {
            Ok((None, false))
        }
    }

    pub async fn drink_dose(&self, user: &User, dose_count: u32) -> Result<()> {
        let coll = self._database.collection::<User>("User");
        coll.update_one(
            doc! {"_id": user.id()},
            doc! {"$inc": {"dose_taken": dose_count}},
            None,
        )
        .await?;
        Ok(())
    }
}
