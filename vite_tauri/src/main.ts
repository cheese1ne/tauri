import './styles.css';
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from '@tauri-apps/api/event'


// 监听DOM构建完成事件
document.addEventListener('DOMContentLoaded', async function () {
  // #app监听指针弹起事件 
  const app_element = document.querySelector.bind(document)('#app')! as HTMLElement;

  app_element.addEventListener('pointerup', async function () {
    const hello_result = (await invoke('hello')) as string;
    app_element.textContent = hello_result;
    setTimeout(() => {
      app_element.textContent = 'Click';
    }, 1000);
  })

  // add-button监听指针弹起事件 弹起时从core process中获取值
  const add_button_element = document.querySelector.bind(document)('add-button') as HTMLElement;
  const counter_element = document.querySelector.bind(document)('counter-number') as HTMLElement;

  add_button_element.addEventListener('pointerup', async function () {
    const counter_result = (await invoke('add_counter', { n: 2 })) as string;
    console.log(counter_result);
    counter_element.textContent = counter_result;
  })

  // clear-button监听指针弹起事件 更新core process以及webview中相关state
  const clear_element = document.querySelector.bind(document)('clear-button') as HTMLElement;
  clear_element.addEventListener('pointerup', async function () {
    const clear_result = (await invoke('clear')) as string;
    counter_element.textContent = clear_result;
  })

  // keep-alive 通过服务端心跳传递来判断服务端状态，在客户端进行显示
  const keep_alive_element = document.querySelector.bind(document)('keep-alive') as HTMLElement;

  // 通过tauri的event listen模块监听服务器心跳
  listen('keep_alive', async function () {
    // 通过样式改变来反应, 此处重点是收到服务器发送消息这个行为，发送的信息不重要，不处理
    keep_alive_element.classList.add('on');
    // 每0.5s恢复原本样式
    setTimeout(() => {
      keep_alive_element.classList.remove('on');
    }, 500);
  });
});