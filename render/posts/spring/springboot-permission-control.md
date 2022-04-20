---
title: "在客户端处理 JWTs 的终极指南（SpringBoot）"
summary: "No matter what he does, every person on earth plays a central role in the history of the world. And normally he doesn't know it"
date: "2021-05-05"
author: "Civitasv"
categories:
  - 安全 
tags:
  - spring
  - security
  - permission
---

> 本文基于[The Ultimate Guide to handling JWTs on frontend clients (GraphQL)](https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/)完成，是翻译，更是自己的理解，部分与原文有较大出入，在技术实现方面，原作者使用 GraphQL 作为服务端，本人使用 SpringBoot 改写之。

## 引言

目前，JWTs(JSON Web Token, 发音为'jot') 日益成为一种鉴权的流行方式，本文以 Springboot 和 [jjwt](https://github.com/jwtk/jjwt) 为例，讨论其优缺点和其在 Web 端的最佳实践方式。

请不要关注于实现技术，而是关注实现的思想。

## 介绍：什么是 JWT？

关于 JWT 的详细介绍见[Introduction to JSON Web Tokens](https://jwt.io/introduction/)

为了实现权限验证，服务端会在用户登录后签发 JWT token 返回客户端，该 token 中的 JSON payload 包含了该用户的特有信息，当客户端发送请求时，在 header 中声明该 token，这样服务端可以解析 token 获取用户信息，然后获取用户权限，若用户具有该权限则返回用户需要的信息。

### 但是为什么服务端不能直接创建 JSON payload 模拟用户呢？

好问题！这就是为什么 JWT 也包括签名，签名由签发该 token 的服务端创建（大概率是登录端点），而接收此 token 的其他任何服务端都可以独立地验证该 token 的签名，使用该签名，服务端可以确保该 token 的 JSON payload 没有被篡改，并且具有合法的来源。

**注：可以理解为，签名就相当于钥匙，一把钥匙开一把锁，服务端创建 token 的时候创创建了一把钥匙，以后也只能用这把钥匙开锁，否则开锁失败，验证失败。**

### 但是如果我有一个未过期的且已签名的 JWT，别人从我的客户端窃取到了该 JWT，他们是不是就能一直用我的 JWT 了？

是的！如果 JWT 被盗，黑客可以一直使用该 JWT，JWT 是独立存在的，接收 JWTs 的 API 无法获取 JWT 的使用者，因此服务端没有办法知道这是一个已经被盗的 token，这是令人难以接受的！因此，JWT 具有过期时间，常设置为 15 分钟，这样即使被盗也很快就会失效了。

> 这两个问题几乎涵盖了使用 JWTs 的所有注意点：1. 应该尽可能的保证 JWTs 的安全；2. 为防止被盗造成的严重后果，JWTs 需要由很短的过期时间。

这也是 JWT 不能存储到 cookies 或者 localstorage 中的原因，否则无法很好的应对 CSRF 和 XSS 攻击：黑客可以使用恶意表单或者脚本获取 cookis 或 localstorage 中的 JWT。

### 所以 JWT 的结构是什么？它看起来什么样？

一个完整的的 JWT 看起来像下面这样：

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o
```

使用 base64 解码后，可以发现 JWT 包含三部分：header、payload 和 signature。

![The 3 parts of a JWT (based on image taken from jwt.io)](/img/in-post/spring/jwt-structure.png)

序列化的格式如下：

`[ base64UrlEncode(header) ] . [ base64UrlEncode(payload) ] . [signature ]`

> JWT 未加密，它是基于 base64 编码和签名的，所以每个人都可以对 token 解码并使用它的数据（payload）。这时，JWT 的签名（signature）就用于验证该 JWT 是否来自一个可信的来源。

下面是 JWT 签发（`/login`）和验证（`/api`）的流程：

![A workflow of how a JWT is issued and then used](/img/in-post/spring/jwt-issued-and-then-used.png)

**额，看起来好复杂，为什么不使用 session 机制呢？**

互联网上对该问题已经讨论很多了，我们简短的（甚至固执的）结论是后端开发者喜欢使用 JWTs 是因为 a) 微服务(microservices) b) 不需要集中的 token 数据库。

在微服务中，每个微服务都可以独立的向服务器发送请求验证 token 的合法性。微服务可以进一步解析 token 提取相关信息，而不需要具有集中的 token 数据库。

这就是为什么 API 开发人员喜欢使用 JWTs，所以，客户端开发者需要弄清楚怎么使用它。

## 基础：登录

现在我们对 JWT 有了一个大概的认识，让我们创建一个简单的登录流程，我们想达到以下效果：

![A login flow for getting a JWT](/img/in-post/spring/jwt-basic-login-flow.png)

### 所以我们如何开始？

这是一个十分简单的登录流程，用户使用用户名和密码发送登录请求，服务端签发 JWT，返回客户端即可。或许您可能是通过 OAuth 或 OAuth2 步骤登录，这并不重要，只要客户端在登陆成功后得到了 JWT 即可。

首先，我们在客户端构建一个简单的登录表单，将用户名(username)和密码(password)发送到服务端。登录按钮的`handleSubmit`处理程序如下：

```js
async function handleSubmit() {
  // ...
  // fetch /login API
  const response = await fetch(`${base}/login`, {
    method: "POST",
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  });
  // ...
  const res = await response.json();
  // ...
  if (res.code !== 200) {
    alert("用户名或密码错误！");
    return;
  }
  const { jwt_token } = res.data;
  // 将token存储
  login({ jwt_token });
}
```

`login` API 会返回**token**数据，然后我们会将其传递到`login`函数中，在该函数中，我们可以决定如何处理获取的 token 数据。

### 所以客户端得到 token 之后，应该存储在哪里？

我们需要将 JWT token 存储在某个地方，这样我们才能在下次请求将其加入到 header 传递到服务端，或许你想使用 localstorage 存储，**不要这样做！**黑客利用 XSS 攻击会轻易获取我们的 token。

### 或许存储到 cookie 中？

将 JWT 存储到 cookie 中也容易导致 XSS 攻击，只要可以使用 Javascript 从客户端读取，它就有可能被盗。或许你认为`httpOnly` cookies 可以帮助应对 XSS 攻击，但黑客又会使用 CSRF 攻击了 😟。使用 httpinly 和一定的 CORS 策略是无法阻止 CSRF 攻击的，因此，若存储在 cookie 中，服务端需要适当的 CSRF 防御策略。

### 那么我们该怎么存储 token 呢？

现在，我们会将其存储到内存中（我们会在本文稍后部分深入讨论持久化）。

```js
let inMemoryToken;

function login({ jwt_token, jwt_token_expiry }) {
  inMemoryToken = {
    token: jwt_token,
    expiry: jwt_token_expiry,
  };
}
```

目前我们在**内存**中存储了该 token。不过，当用户新建页面，内存中的 token 会因为刷新而消失，我们稍后会处理这个问题。我也会解释为什么需要`jwt_token_expiry`。

### 好了，现在我们已经有了 token，我们该如何使用它呢？

- 每个需要权限验证的 API 请求，需要在 header 中添加该 token；
- 根据 `inMemoryToken` 变量是否为空可以检查用户是否已经登录；
- （可选）我们甚至可以在前端解析 JWT 获取 payload 中的数据。

### 如何检查用户是否登录？

```js
const jwt_token = inMemoryToken;
if (!jwt_token) {
  // 跳转至登录页
  location.href = `${base}/page/login`;
}
return jwt_token;
```

## 基础：服务端设置

是时候编写服务端程序了，处理流程是从 token 变量中获取数据，如果 token 不为空，则将其传递到服务端。

![Using the JWT in Springboot](/img/in-post/spring/jwt-use-in-springboot.png)

客户端在进行请求时，如果需要进行权限验证，需要在`Header`中添加`Authorization`属性，值设置为`Bearer <token>`（也可以使用拦截器为每个请求添加该 header）。

如果请求需要进行权限验证，Springboot 会解析`Header`中的`Authorization`属性，从而获取 JWT，然后判断用户是否有权限进行操作。

下面是使用拦截器解析`Authorization`的程序：

```java
public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object object) {
    // 如果不是映射到方法直接通过
    if (!(object instanceof HandlerMethod)) {
        return true;
    }
    HandlerMethod handlerMethod = (HandlerMethod) object;
    Method method = handlerMethod.getMethod();
    //检查是否需要进行权限检测
    if (method.isAnnotationPresent(VerifyToken.class)) {
        VerifyToken verifyToken = method.getAnnotation(VerifyToken.class);
        if (verifyToken.required()) {
            String token = httpServletRequest.getHeader("Authorization");
            // 执行认证
            if (token == null) {
                throw new CustomException(ResultCode.AUTH_NEED, "请登录后执行该操作");
            }
            token = token.substring(7);
            // 获取 token 中的 username
            String userId = tokenService.getUserIdFromToken(token);
            if (userId == null)
                throw new CustomException(ResultCode.AUTH_NEED, "请登录后执行该操作");
            // 验证 token
            try {
                List<String> permissions = tokenService.getPermissions(token);
                // 根据用户角色和url，判断该用户是否具有该权限
                String url = verifyToken.url();
                if (permissions.contains(url)) {
                    return true;
                }
                // 无权限
                throw new CustomException();
            } catch (CustomException e) {
                throw new CustomException(ResultCode.METHOD_NOT_ALLOWED, "用户不具有该权限");
            } catch (Exception e) {
                throw new CustomException(ResultCode.AUTH_NEED, "登录已过期，请重新登录");
            }
        }
    }
    return true;
}
```

`VerifyToken`注解如下：

```java
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface VerifyToken {
    boolean required() default true;

    String url() default "";
}
```

使用`VerifyToken`注解，结合拦截器，能够自定义需要进行权限验证的请求，获取当前请求的 url，从而判断该用户是否具有权限。

### token 过期处理

假定 JWT token 有效期为 15 分钟，如果发送请求的时候，token 已经过期，服务端就会拒绝我们的请求（假设返回`401: Unauthorized`错误）。因此，我们需要添加过期处理。

程序大致如下：

```js
if (res.code === 401) {
  // or res.code === 200
  if (inMemoryToken) {
    await logout();
    // ...
  }
}
```

你可能已经注意到这会导致相当差的用户体验，每次 token 失效都需要用户重新登录。**因此 App/Web 需要实现无感知刷新 JWT token，事实上，这也就是为什么 refresh_token 会出现的原因**。

## 基础：退出登录

使用 JWT，退出登录时，我们只需要在内存中删除 token 即可。

![Using the JWT in Springboot logout](/img/in-post/spring/jwt-use-in-springboot2.png)

### 所以，服务端不需要提供 `/logout` API 吗？

确实，服务端不需要提供该 API，事实上，任何接收该 JWT 的微服务端依然会接受它，如果在认证服务端删除了该 JWT，其它微服务不会受影响，仍然会继续接受该 token（因为 JWTs 的最大优点就是不需要集中的处理 token）。

### 该删除的 token 依然合法，如果我需要确保该 token 不能再被使用了，该怎么处理？

这就是为什么我们要将 JWT 有效时间设置为一个很小的值的原因，也是你需要尽可能的保护你的 token 的安全的原因。该 token 在删除后依然合法，但是其有效时间很短，所以能够在一定程度上减少被恶意使用的可能性。

### 当我在其它标签页退出时会怎么样？

处理这个的一种方式是为`localstorage`提供一个全局监听事件。在一个标签页面更新`logout`键时，其它页面会触发该事件，使用户重新登录。

```js
window.addEventListener("storage", syncLogout);

function syncLogout() {
  if (event.key === "logout") {
    if (!inMemoryToken) {
      // 如果未登录，则无需执行
      return;
    }
    // ...
    inMemoryToken = null; // 将token置空
    location.href = `${base}/page/login`;
  }
}
```

**logout 之后需要做的两件事：**

1. 删除 token
2. 设置 localstorage 中的`logout`键

```js
async function logout() {
  inMemoryToken = null; // 将token置空
  localStorage.setItem("logout", Date.now());
}
```

这时无论从哪个标签页退出登录，其它页面都会重新登录。

## 静默刷新

按照目前的实现方式，我们的系统主要有两个问题：

1. token 失效时间往往设置为 15 分钟，一旦失效，用户必须重新登陆，理想情况下，我们希望用户长时间登录。
2. 目前 token 存储在内存中，并未在客户端持久化，这意味着一旦用户退出登录，重新进入必须再次登录。

为解决这两个问题，我们需要引入**refresh token**，它有两个特点：

1. 可以使用**refresh token**访问 token 刷新接口（假设为`/token/refresh`），在**Jwt token**过期前获取一个新的 token；
2. 可以在客户端安全的持久化。

### refresh token 如何工作？

refresh_token 作为鉴权的一部分，需要将其与特定的用户关联，以生成新的 token。要实现这一点，我们可以在 JWT claim 信息中添加`username`唯一约束，并进行签名，从而安全的刷新 token。

在客户端，在 JWT token 过期之前，我们访问`/token/refresh`接口以获取一个新的 JWT token。

### 客户端如何安全的存储 refresh token？

我们可以将 refresh token 存储在 http only cookie 中，这样可以减轻 XSS 攻击，同时，即使黑客构建 CSRF 攻击执行了刷新接口操作，他也没办法获取返回的新 token。

回顾一下，这就是我们如何最佳的持久化 JWT 的方式:

存储 JWT token 到 localstorage 中（容易受 XSS 攻击）< 存储 JWT token 到 httpOnly 属性的 cookie 中（容易受 CSRF，减轻 XSS 攻击）< 存储 refresh token 到 httpOnly 属性中（免疫 CSRF 攻击，减轻 XSS 攻击）。

注意，虽然这种方式尚无法应对严重的 XSS 攻击，但是结合一些常用的 XSS 防御技术后，httpOnly cookie 是一种持久化 refresh token 的推荐方法，这种方式相直接存储 JWT token 的最大好处是可以免疫 CSRF 攻击。

### 加入了 refresh token 的新登录流程

在登陆阶段，随原来的 JWT token 一同返回的还有 refresh token。如下图所示：

![Login with refresh token](/img/in-post/spring/login-with-refresh-token.png)

1. 用户点击登录，访问登录接口；
2. 服务端生成 JWT token 和 refresh token，并使用秘识（secret）进行签名；
3. `refresh_token` 存储在 cookie 中，且设置 `httpOnly` 属性，`jwt_token` 和 `jwt_token_expiry` 储存在内存中；
4. 基于 `jwt_token_expiry` 可以做静默刷新。

### 静默刷新是怎么样的？

![Silent refresh workflow](/img/in-post/spring/silent-refresh-work-flow.png)

具体步骤为：

1. 访问`/token/refresh`接口；
2. 服务端读取`httpOnly` cookie，判断`refresh_token`是否存在，然后使用`secret`检验，若合法，则进行第三步；
3. 服务端生成新的`jwt_token`和`jwt_token_expiry`，返回客户端，然后生成新的`refresh_token`，使用`Set-cookie`设置。

这样，我们就解决了第一个问题。

## 持久化会话

目前，即使`jwt_token`失效，通过静默刷新流程，我们可以保证用户不会掉线重新登陆，下面让我们解决第二个问题：持久化会话。

按照目前的实现方案，如果用户进行刷新或关闭标签页重新进入，必须重新进行登录。

我们想要实现即使用户刷新或重启浏览器，用户依然可以保持登录状态。由于我们将 JWT 存储在内存中，其在用户刷新或重启浏览器后会消失，因此我们没办法实现该功能。

### 所以我们应该如何安全的持久化呢？

答案是 refresh token！我们可以安全的持久化 refresh tokens 并且使用其进行静默刷新，我们可以使用静默刷新机制进行 JWT token 的刷新，也可以使用该机制获得一个新的 JWT token。

有了 refresh token，刷新/关闭浏览器重新打开的流程为：

![jwt-refresh-or-reopen](/img/in-post/spring/jwt-refresh-or-reopen.png)

### 错误处理

如果 refresh token 不存在（用户第一次登录或用户点击退出后重新登录）或失效（如用户很久未登录或服务端秘识（secret）发生改变），则 token 校验失败，将发生 401 错误，客户端接收到该错误后将重定向至登陆页面。

### 强制退出

> 原作者是将 refresh_token 存入数据库的，其给出的一种实现强制退出的方式为使得该用户所关联的 refresh token 全部失效（大概就是删除数据库中某用户关联的 refresh token）。

但我认为，如果将 refresh_token 存入数据库便失去了 JWT 存在的意义，因为 JWT 本身就可以通过签名验证自身的合法性，加入数据库使得无状态的 JWT 有状态了，显得不伦不类的，当然，也许是我研究的还不够:)。

## 示例代码

本人根据该篇文章，使用`MySQL + SpringBoot + Thymeleaf + jjwt`进行了权限验证的实现。

### 建表

按照惯例，首先新建权限验证五张表：**user role permission user_role role_permission**，其中`user`和`role`为多对多关系，`role`和`permission`为多对多关系，sql 语句见[jwt_test](https://github.com/Civitasv/springboot-jwt/blob/master/src/main/resources/sql/jwt_test.sql)。

添加用户：

|   username    | password |
| :-----------: | :------: |
|  normal_user  |  12345   |
| administrator |  12345   |
| userandadmin  |  12345   |

添加角色：

| id  |   role   |
| :-: | :------: |
|  1  | 普通用户 |
|  2  |  管理员  |

添加权限：

| id  |     name     |    description     |   url   |
| :-: | :----------: | :----------------: | :-----: |
|  1  | 普通用户界面 | 可进入普通用户页面 | /normal |
|  2  |   管理界面   |   可进入管理页面   | /manage |

指派用户`normal_user`角色为普通用户，具有进入普通页面的权限，不具有进入管理页面权限；指派用户`administrator`角色为管理员，具有进入管理页面的权限，不具有进入普通用户页面的权限，指派用户`userandadmin`为普通用户和管理员，同时具有进入普通用户页面和进入管理页面的权限。

|    user_id    | role_id |
| :-----------: | :-----: |
|  normal_user  |    1    |
| administrator |    2    |
| userandadmin  |    1    |
| userandadmin  |    2    |

---

| role_id | permission_id |
| :-----: | :-----------: |
|    1    |       1       |
|    2    |       2       |

### 客户端——登录

使用 Thymeleaf 构造登陆表单，如下图所示。

![login](/img/in-post/spring/springboot-login.png)

用户点击登录，有以下两种情况：

1. 用户登录成功，则服务端签发`jwt_token`和`refresh_token`，并将`jwt_token`返回至客户端，客户端保存至内存中，服务端将`refresh_token`添加到`httpOnly cookies`中，然后基于`jwt_token_expiry`进行静默刷新；
2. 用户登录失败，则提示需要重新登录。

客户端请求：

```js
let inMemoryToken; // 用于验证的token存入内存

function login({ jwt_token, jwt_token_expiry }) {
  inMemoryToken = {
    token: jwt_token,
    expiry: jwt_token_expiry,
  };
}

async function handleSubmit(username, password) {
  try {
    const response = await fetch(`${base}/user/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });
    if (response.ok) {
      const res = await response.json();
      if (res.code !== 200) {
        alert("用户名或密码错误！");
        return;
      }
      const { jwt_token, jwt_token_expiry } = res.data;
      login({ jwt_token, jwt_token_expiry });
      location.href = `${base}/`; // 进入主页
    } else {
      console.log(response.statusText);
    }
  } catch (e) {
    console.log(e);
  }
}

$("#login").click(async () => {
  const username = $("#username").val();
  const password = $("#password").val();
  if (username === "" || password === "") {
    alert("用户名和密码不能为空！");
    return;
  }
  await handleSubmit(username, password);
});
```

### 客户端——静默刷新

进入主页后，需要开始静默刷新，以防止用户进行刷新或关闭标签页需要重新登录，同时防止由于`jwt_token`过期而导致用户再次登录（前文已经详细解释原因）。

在`startCountdown`函数中，定义了一个定时事件，每一分钟检验一次`jwt_token`是否过期，若一分钟后过期，则请求`/token/refresh`接口进行`jwt_token`的刷新：

```js
let interval; // 定时器
function addMinutes(dt, minutes) {
  return new Date(dt.getTime() + minutes * 60000);
}

function startCountdown() {
  interval = setInterval(async () => {
    if (inMemoryToken) {
      if (addMinutes(new Date(), 1) >= new Date(inMemoryToken.expiry)) {
        await auth();
      }
    } else {
      await auth();
    }
  }, 60000);
}

$(function () {
  auth().then(() => {
    console.log(inMemoryToken);
    if (inMemoryToken) {
      // 刷新成功
      startCountdown();
    } else {
      alert("登录信息已过期，请重新登录！");
    }
  });
});
```

在`auth`函数中，我们访问`/token/refresh`接口进行`jwt_token`的刷新：

```js
async function auth() {
  if (!inMemoryToken) {
    const url = `${base}/token/refresh`;
    try {
      const response = await fetch(url, {
        method: "GET",
      });
      if (response.ok) {
        const res = await response.json();
        if (res.code !== 200) {
          if (inMemoryToken) {
            await logout();
          }
          // rediret to 登录
          location.href = `${base}/login`;
        } else {
          const { jwt_token, jwt_token_expiry } = res.data;
          login({ jwt_token, jwt_token_expiry });
        }
      } else {
        console.log(response.statusText);
      }
    } catch (e) {
      console.log(e);
      if (inMemoryToken) {
        await logout();
      }
      // rediret to 登录
      location.href = `${base}/login`;
    }
  }
}
```

### 客户端——退出登录

在`logout`函数中，处理退出后的逻辑，具体包括：

1. 删除内存中的`jwt_token`和定时事件；
2. 设置`localstorage`中的`logout`的值；
3. 访问`/user/logout`接口进行刷新接口的注销；
4. 返回登陆页面。

```js
async function logout() {
  inMemoryToken = null; // 将token置空
  if (interval) clearInterval(interval); // 停止计时事件
  localStorage.setItem("logout", Date.now());
  const url = `${base}/user/logout`;
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });
    if (response.ok) {
      const res = await response.json();
      console.log(res.code !== 200 ? "退出失败" : "退出成功");
    } else {
      console.log(response.statusText);
    }
  } catch (e) {
    console.log(e);
  }
  location.href = `${base}/login`;
}

$("#logout").click(async () => {
  await logout();
});
```

当`localstorage`中的`logout`被重新设置之后，将触发其它标签页的`syncLogout`事件，使其它标签页也重定向至登录页：

```js
window.addEventListener("storage", syncLogout);
function syncLogout(event) {
  if (event.key === "logout") {
    if (!inMemoryToken) {
      return;
    }
    console.log("logged out from storage!");
    inMemoryToken = null; // 将token置空
    if (interval) clearInterval(interval); // 停止倒计时
    location.href = `${base}/login`;
  }
}
```

### 客户端——权限验证

当访问需要进行权限验证的页面，需要在`Header`中添加`jwt_token`，服务端拦截请求判断该用户是否有此权限，有权限则放行否则不允许执行。

下为系统主页面，用户具有**管理员**角色，不具有**普通用户**角色效果：

![jwt homepage](/img/in-post/spring/jwt-homepage.gif)

实现功能：若用户具有**普通用户**角色，则可以进入`Normal User`页面，若用户具有**管理员**角色，则可以进入`Administrator`页面。

```js
$("#normal").click(async () => {
  const url = `${base}/normal`;
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${inMemoryToken["token"]}`,
      },
    });
    if (response.ok) {
      const res = await response.json();
      if (res.code !== 200) {
        alert(res.message);
        return;
      }
      alert("您已成功进入用户页面！");
    } else {
      console.log(response.statusText);
    }
  } catch (e) {
    console.log(e);
  }
});
$("#admin").click(async () => {
  const url = `${base}/manage`;
  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${inMemoryToken["token"]}`,
      },
    });
    if (response.ok) {
      const res = await response.json();
      if (res.code !== 200) {
        alert(res.message);
        return;
      }
      alert("您已成功进入管理页面！");
    } else {
      console.log(response.statusText);
    }
  } catch (e) {
    console.log(e);
  }
});
```

### 服务端——生成 token

#### a. jwt token

服务端定义密钥 secret，然后将用户名和用户权限存储至 `jwt_token payload` 中，生成`jwt_token`，其中用户名是用户的唯一标识，可以将 `jwt_token` 与特定用户关联，用户权限用于验证某用户是否具有某请求的权限。

```java
// access token 过期时间15分钟
private static final long ACCESS_TOKEN_EXPIRE_TIME = 15 * 60 * 1000L;

private static final String KEY = "3EK6FD+o0+c7tzBNVfjpMkNDi2yARAAKzQlk8O2IKoxQu4nF7EdAh8s3TwpHwrdWT6R";

@Override
public Map<String, Object> getJWTToken(User user) {
    Date date = new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRE_TIME);
    // 将用户具有的权限存入claim
    List<String> permissions = new ArrayList<>();
    for (Role role : user.getRoles()) {
        for (Permission permission : role.getPermissions()) {
            permissions.add(permission.getUrl());
        }
    }
    Key signKey = new SecretKeySpec(DatatypeConverter.parseBase64Binary(KEY), SignatureAlgorithm.HS256.getJcaName());
    String accessToken = Jwts.builder()
            .setSubject(user.getUsername())
            .claim("permissions", permissions)
            .setExpiration(date)
            .signWith(signKey)
            .compact();
    Map<String, Object> map = new HashMap<>();
    map.put("jwtToken", accessToken);
    map.put("jwtTokenExpiry", date.getTime());
    return map;
}
```

#### b. refresh token

服务端定义密钥 secret，然后将用户名存储至 `jwt_token payload` 中，生成`refresh_token`，其中用户名是用户的唯一标识，可以将 `refresh_token` 与特定用户关联。

```java
// refresh token 过期时间30天，意味着用户如果一个月都没登录，则需要重新登录一次
private static final long REFRESH_TOKEN_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000L;
private static final String KEY = "3EK6FD+o0+c7tzBNVfjpMkNDi2yARAAKzQlk8O2IKoxQu4nF7EdAh8s3TwpHwrdWT6R";

public Map<String, Object> getRefreshToken(String username) {
    Date date = new Date(System.currentTimeMillis() + REFRESH_TOKEN_EXPIRE_TIME);
    Map<String, Object> map = new HashMap<>();
    Key signKey = new SecretKeySpec(DatatypeConverter.parseBase64Binary(KEY), SignatureAlgorithm.HS256.getJcaName());
    String refreshToken = Jwts.builder()
            .setSubject(username)
            .setExpiration(date)
            .signWith(signKey)
            .compact();
    map.put("refreshToken", refreshToken); // 使用用户id签发refresh token
    map.put("refreshTokenMaxAge", REFRESH_TOKEN_EXPIRE_TIME / 1000);
    return map;
}
```

### 服务端——静默刷新

服务端定义 jwt token 刷新接口，接收 refresh token 进行 jwt token 的刷新。

```java
public String refresh(@CookieValue(value = "refresh_token", defaultValue = "") String refreshToken, HttpServletResponse response) {
    // 验证 refresh token
    if (refreshToken.isEmpty()) {
        return new Result<Map<String, Object>>().success(false).message("token不可以为空").code(ResultCode.AUTH_NEED).toString();
    }
    if (tokenService.isExpire(refreshToken)) {
        return new Result<Map<String, Object>>().success(false).message("刷新token已经失效").code(ResultCode.AUTH_NEED).toString();
    }
    // 获取username
    String username = tokenService.getUsernameFromToken(refreshToken);
    if (Objects.isNull(username)) {
        return new Result<Map<String, Object>>().success(false).message("刷新token已经失效").code(ResultCode.AUTH_NEED).toString();
    }
    // 根据userId获取user
    User user = userService.getByUserName(username);
    // 重新生成 access token 和 refresh token
    Map<String, Object> accessTokenInfo = tokenService.getJWTToken(user); // 获得access token
    Map<String, Object> map = new HashMap<>();
    map.put("jwt_token", accessTokenInfo.get("jwtToken"));
    map.put("jwt_token_expiry", accessTokenInfo.get("jwtTokenExpiry"));

    Map<String, Object> refreshTokenInfo = tokenService.getRefreshToken(username);
    // 将 refresh token 加入httponly cookie
    Cookie cookie = new Cookie("refresh_token", refreshTokenInfo.get("refreshToken").toString());
    cookie.setMaxAge(Integer.parseInt(refreshTokenInfo.get("refreshTokenMaxAge").toString()));
    cookie.setHttpOnly(true);
    cookie.setPath("/");
    response.addCookie(cookie);

    return new Result<Map<String, Object>>().success(true).message("刷新成功").code(ResultCode.OK).data(map).toString();
}
```

### 服务端——退出登录

客户端点击退出登录，服务端需要将发送的`refresh_token`进行过期处理。

```java
public String logout(@CookieValue(value = "refresh_token", defaultValue = "") String refreshToken, HttpServletRequest request, HttpServletResponse response) {
    if (refreshToken.isEmpty()) {
        return new Result<Map<String, Object>>().success(true).message("退出成功").code(ResultCode.OK).toString();
    }
    if (tokenService.isExpire(refreshToken)) {
        return new Result<Map<String, Object>>().success(true).message("退出成功").code(ResultCode.OK).toString();
    }
    // 清除token
    Cookie[] cookies = request.getCookies();
    Optional<Cookie> cookieOptional = Arrays.stream(cookies)
            .filter(cookie1 -> "refresh_token".equals(cookie1.getName()))
            .findFirst();
    if (cookieOptional.isPresent()) {
        Cookie cookie = cookieOptional.get();
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        response.addCookie(cookie);
    }
    return new Result<Map<String, Object>>().success(true).message("退出成功").code(ResultCode.OK).toString();
}
```

### 服务端——权限验证

服务端定义拦截器，对每个需要权限验证的请求进行拦截，解析`jwy_token`中的`permissions`，获取该用户具有的权限，若该用户具有该权限则放行否则不允许执行，上文已经提到该代码，但为了完整性，仍然贴上来。

```java
public boolean preHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object object) {
    // 如果不是映射到方法直接通过
    if (!(object instanceof HandlerMethod)) {
        return true;
    }
    HandlerMethod handlerMethod = (HandlerMethod) object;
    Method method = handlerMethod.getMethod();
    //检查是否需要进行权限检测
    if (method.isAnnotationPresent(VerifyToken.class)) {
        VerifyToken verifyToken = method.getAnnotation(VerifyToken.class);
        if (verifyToken.required()) {
            String token = httpServletRequest.getHeader("Authorization");
            // 执行认证
            if (token == null) {
                throw new CustomException(ResultCode.AUTH_NEED, "请登录后执行该操作");
            }
            token = token.substring(7);
            // 获取 token 中的 username
            String userId = tokenService.getUserIdFromToken(token);
            if (userId == null)
                throw new CustomException(ResultCode.AUTH_NEED, "请登录后执行该操作");
            // 验证 token
            try {
                List<String> permissions = tokenService.getPermissions(token);
                // 根据用户角色和url，判断该用户是否具有该权限
                String url = verifyToken.url();
                if (permissions.contains(url)) {
                    return true;
                }
                // 无权限
                throw new CustomException();
            } catch (CustomException e) {
                throw new CustomException(ResultCode.METHOD_NOT_ALLOWED, "用户不具有该权限");
            } catch (Exception e) {
                throw new CustomException(ResultCode.AUTH_NEED, "登录已过期，请重新登录");
            }
        }
    }
    return true;
}
```

## 总结

如果您完成了上面的所有部分，您的应用程序就拥有了现代应用程序的大部分功能，并且能够避免 JWT 实现中常见的安全陷阱！

如果您有任何疑问、建议或反馈，欢迎留言。

本文代码地址：[springboot_jwt](https://github.com/Civitasv/springboot-jwt)
