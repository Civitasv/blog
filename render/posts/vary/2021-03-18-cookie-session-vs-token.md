---
title: "Cookie + Session Vs Token"
summary: "HTTP 是无状态的，即每次请求之间没有关联，为了使后端识别每一个用户，每一个从客户端发送的链接都需要有唯一标识"
date: "2021-03-18"
author: "Civitasv"
categories:
  - HTTP 
tags:
  - cookie
  - session
  - token
---

HTTP 是无状态的，即每次请求之间没有关联，为了使后端识别每一个用户，每一个从客户端发送的链接都需要有**唯一标识**。

## Cookie + Session

- 客户端第一次请求服务器，服务端会创建 Session，返回 SessionId，通过`Set-Cookie`响应将其保存至 Cookie 中，客户端第二次请求，服务端解析 Cookie 中的 SessionId，可以获取 Session。

**优点\***：

1. Cookie 可以设置`http-only`属性，设置该属性后将无法通过 js 脚本读取，能够有效避免 XSS 攻击；
2. 开箱即用，不需要在客户端实现 API。

**缺点**：

1. Cookie 会与特定的域名绑定，所以跨域访问需要配置反向代理；
2. 容易导致 CSRF/XSRF 即跨站请求伪造攻击；
   - 以 Java Web 程序为例，session 中会存储用户信息，假设用户首先登陆了一个受信任的网站 A，cookie 信息中将会存储会话 sessionid，此时不关闭 A，继续访问某钓鱼网站 B，若 B 中存在图片`<img src=http://www.mybank.com/Transfer.php?toBankId=11&money=1000>`，点击图片之后将会跳转访问 A 网站，此时对 A 网站的 session 未被销毁，cookie 也存在，所以 A 网站会认为仍然是用户操作，这样钓鱼网站 B 就达到了模拟用户操作的目的。
3. 每次请求都会发送该信息，即使该请求不需要进行验证；
4. Cookie+Session 中，用户验证时一般会在 Session 中存储用户信息，不安全。

## Token

- 客户端请求，服务端根据用户信息创建 Token，响应给客户端，客户端保存 Token 至 Cookie/SessionLocalStorage/LocalStorage 等存储空间中，客户端第二次请求，将 Token 放置在请求头中（规范，其实不放在请求头也可以），服务端拦截请求，获取 Token 并验证。

**优点**：

1. 可以只验证想要验证的请求；
2. 免疫 CSRF/XSRF 攻击；
3. 可以跨域共享，Token 可以被发送至多个服务端，因此，域名 myapp.com 上的一个 web 应用程序可以同时向 myservice1.com 和 myservice2.com 发送授权请求；
4. Token 仅仅是个令牌，不会存储用户信息。

**缺点**：

1. 必须手动将 Token 存储到一个地方，而 SessionId 则会自动存储到 Cookie 中，常用存储位置：
   - LocalStorage
     - 缺点：即使关闭了浏览器窗口，token 依然存在；
   - SessionStorage
     - 优点：关闭浏览器窗口后，token 即消失；
     - 缺点：登录验证后，打开一个新的选项卡，仍然需要验证，即每个窗口存在自己的`SessionStorage`
   - Cookie
     - 优点：默认情况下，关闭浏览器窗口后，token 即消失；
     - 缺点：每次请求，Cookie 都会被发送。

注意，Cookie 只是个存储空间，可以用于存储 Sessionid 或 Token。只不过一般 SessionId 使用 Cookie 进行存储，token 使用 LocalStorage 进行存储。
