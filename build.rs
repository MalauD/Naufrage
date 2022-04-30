use std::process::Command;

fn main() {
    println!("cargo:rerun-if-changed=static/src");

    #[cfg(debug_assertions)]
    Command::new("npx")
        .current_dir("static")
        .args(&["webpack", "--mode=development"])
        .status()
        .unwrap();

    #[cfg(not(debug_assertions))]
    Command::new("npx")
        .current_dir("static")
        .args(&["webpack", "--mode=production"])
        .status()
        .unwrap();
}
