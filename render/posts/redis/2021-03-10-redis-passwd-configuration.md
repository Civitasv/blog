---
title: "Redis 密码配置"
date: "2021-03-10"
author: "Civitasv"
categories:
  - redis 
tags:
  - redis
---

为了安全，必须设计密码。

1. 修改 redis.conf 文件，追加：`requirepass senmeng0921`
2. 重新启动服务：`killall redis-server`
3. 启动：`/usr/local/redis/bin/redis-server /usr/local/redis/conf/redis.conf`
4. 登录 redis 服务器：`/usr/local/redis/bin/redis-cli -h 127.0.01 -p 6379 -a password`，或执行`auth password`进行验证
