// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use tauri::Manager; // tauri中AppHandle
use tauri::State; // tauri中数据状态管理
use tokio::time::{sleep, Duration}; // 引入tokio库用来定时发送消息

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 获取app_handler, 这个是与core process与webview基于时间通信的处理对象
            let app_handler = app.app_handle();
            tauri::async_runtime::spawn(async move {
                loop {
                    sleep(Duration::from_millis(1000)).await;
                    println!("core process send message.");
                    app_handler.emit_all("keep_alive", "ping").unwrap();
                }
            });
            Ok(())
        })
        // tauri中State管理需要定义在这里
        .manage(Counter::default())
        .invoke_handler(tauri::generate_handler![
            hello,
            add_counter,
            clear,
            keep_alive
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn hello() -> String {
    String::from("Hello World")
}

#[tauri::command]
fn add_counter(n: i32, counter: State<'_, Counter>) -> String {
    // 保证线程安全对counter进行加锁
    let mut counter = counter.0.lock().unwrap();
    *counter += n;
    counter.to_string()
}

#[tauri::command]
fn clear(counter: State<'_, Counter>) -> String {
    // 保证线程安全对counter进行加锁
    let mut counter = counter.0.lock().unwrap();
    *counter = 0;
    format!("{}", counter)
}

#[tauri::command]
fn keep_alive() {}

/**
 * #[derive(Default)] 为结构体提供default()方法为其中的属性初始化
 */
#[derive(Default)]
struct Counter(Arc<Mutex<i32>>);
