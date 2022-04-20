---
title: "Redis 主从模式"
summary: "Redis 数据库与传统数据库是并行的，传统关系数据库保存结构化数据，Redis 数据库保存“临时”数据。Redis 具备一项很强大的功能：持久化数据"
date: "2021-03-12"
author: "Civitasv"
categories:
  - redis 
tags:
  - redis
---

Redis 数据库与传统数据库是并行的，传统关系数据库保存结构化数据，Redis 数据库保存“临时”数据。Redis 具备一项很强大的功能：持久化数据。

一旦出现问题必须保证所有的数据可以快速恢复处理。 + 离线备份； + 在线备份，数据出现问题时自动备份。

![主从设计](/img/in-post/redis/Redis主从设计.png)

## 主从模式实现

必须有三台 Redis 实例，在一台主机上也可以模拟。

端口 6379 为主服务，6380 和 6381 为从服务。

1. 主服务器不需要做出任何变化；
2. 所有的从服务器得 redis 配置文件必须要求明确的设置其对应得主服务器；
   - 配置`slaveof <masterip> <masterport>`
   - 设置主服务器得密码：`masterauth <masterpassword>`
3. 启动所有 Redis 实例
4. 登录主服务器查看所有的副本信息：`redis-cli -h <masterip> -p <masterport> -a <masterpassword> info replication`或登录之后执行`info replication`查看
5. 此时在主服务器保存数据也会被保存至从服务器上，同时，从服务器不能用于设置数据了，处于`read-only`状态

主从模式设计的最大好处在于可以自动对数据进行备份，缺点在于只能做备份，但无法将主服务器切换至从服务器使用，所以实际开发中也很少使用。
