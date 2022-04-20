---
title: "使用 Java 操作 Redis"
date: "2021-03-12"
author: "Civitasv"
categories:
  - redis 
tags:
  - redis
---

## 连接 Redis 数据库

```java
public class ConnectRedisServer {
    private static final String REDIS_HOST = "47.100.65.60";
    private static final int REDIS_PORT = 6379;
    private static final String REDIS_AUTH = "senmeng0921";

    public static void main(String[] args) {
        Jedis jedis = new Jedis(REDIS_HOST, REDIS_PORT);
        jedis.auth(REDIS_AUTH);
        System.out.println(jedis.ping());
    }
}
```

## Jedis 数据操作

Jedis 命令与 Redis 数据操作中得命令如出一辙。

## Jedis 连接池

为了提高性能，需要使用数据库连接池，Jedis 内部支持数据库连接池操作。

```java
public class JedisConnectionPool {
    private static final String REDIS_HOST = "47.100.65.60";
    private static final int REDIS_PORT = 6379;
    private static final String REDIS_AUTH = "senmeng0921";

    private static final int MAX_TOTAL = 1000;
    private static final int MAX_IDLE = 200;
    private static final int MAX_WAIT_MILLS = 1000;
    private static final boolean TEST_ON_BORROW = true;
    private static final int TIMEOUT = 2000;

    public static void main(String[] args) {
        JedisPoolConfig config = new JedisPoolConfig();
        config.setMaxTotal(MAX_TOTAL); // 最大连接数
        config.setMaxIdle(MAX_IDLE); // 空闲连接数
        config.setMaxWaitMillis(MAX_WAIT_MILLS); // 最大等待时间
        config.setTestOnBorrow(TEST_ON_BORROW); // 是否要进行连接测试

        JedisPool pool = new JedisPool(config, REDIS_HOST, REDIS_PORT, TIMEOUT, REDIS_AUTH);
        Jedis jedis = pool.getResource();
        System.out.println(jedis.ping());
        jedis.close();
        pool.close(); // 项目执行完毕才关闭连接池
    }
}
```
