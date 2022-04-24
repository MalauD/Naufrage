use crate::{db::MongoClient, models::User};
use bson::oid::ObjectId;
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

    pub async fn save_user(&self, user: User) -> Result<()> {
        let coll = self._database.collection::<User>("User");
        coll.insert_one(user, None).await?;
        Ok(())
    }

    pub async fn has_user_by_name(&self, user: &User) -> Result<bool> {
        let coll = self._database.collection::<User>("User");
        coll.count_documents(doc! {"username": user.get_username()}, None)
            .await
            .map(|c| c != 0)
    }
}
