---
title: "Redis乐观锁"
summary: "在数据库执行操作的时候，为了保证数据的一致性，需要有悲观锁和乐观锁机制"
date: "2021-03-09"
author: "Civitasv"
categories:
  - redis 
tags:
  - redis
---

在数据库执行操作的时候，为了保证数据的一致性，需要有悲观锁和乐观锁机制。

悲观锁：基于数据库的操作实现（SQL 语句）；
乐观锁：基于算法的实现。

Redis 直接支持乐观锁。
