pub struct AppSettings {
    max_dose: u32,
}

impl AppSettings {
    pub fn new(max_dose: u32) -> Self {
        Self { max_dose }
    }

    /// Get the app settings's max dose.
    pub fn max_dose(&self) -> u32 {
        self.max_dose
    }
}
