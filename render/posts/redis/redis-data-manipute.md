---
title: "Redis数据操作"
summary: ""
date: "2021-03-09"
author: "Civitasv"
categories:
  - redis 
tags:
  - redis
---

## redis-benchmark

使用`redis-benchmark`（`/usr/local/redis/bin/redis-benchmark`）命令测试：`redis-benchmark -h 127.0.0.1 -p 6379 -c 10000 -d 10 -n 10000`

**redis-benchmark**命令参数：

```text
-h <hostname>      Server hostname (default 127.0.0.1)
-p <port>          Server port (default 6379)
-s <socket>        Server socket (overrides host and port)
-a <password>      Password for Redis Auth
--user <username>  Used to send ACL style 'AUTH username pass'. Needs -a.
-c <clients>       Number of parallel connections (default 50)
-n <requests>      Total number of requests (default 100000)
-d <size>          Data size of SET/GET value in bytes (default 3)
--dbnum <db>       SELECT the specified db number (default 0)
--threads <num>    Enable multi-thread mode.
--cluster          Enable cluster mode.
--enable-tracking  Send CLIENT TRACKING on before starting benchmark.
-k <boolean>       1=keep alive 0=reconnect (default 1)
-r <keyspacelen>   Use random keys for SET/GET/INCR, random values for SADD,
                random members and scores for ZADD.
```

## 字符串类型

- 设置操作数据：`set KEY VALUE;`
- 查询 key：`key KEY`
  - 可以使用`key *`获取所有`KEY`
  - 可以使用`key user-*`获取所有以`user-`开头的`KEY`
- 查询数据：`get KEY;`
  - 如果在数据查询时没有对应的 key 内容，则返回的是`(nil)`
  - 获取数据时没有`*`通配符
- 清空：`flushdb`
- 不覆盖设置：`setnx KEY VALUE;`
  - 不覆盖的意思是如果该`key`已经存在，则不再设置
  - 若返回值为 0，设置失败，返回值为 1，设置成功
- 设置数据有效期：`setex KEY TIME VALUE;`
  - `setex 110-code 10 8789`：10 秒销毁
  - `ttl key`可以查看该 key 剩余时间，如果已经消失返回`-2`
  - `persist key`可以取消 key 的消失，这时`ttl key`返回`-1`
- 设置多个 key：`mset KEY1 VALUE1 KEY2 VALUE2...;`
- 不覆盖设置多个 key：`msetnx KEY1 VALUE1 KEY2 VALUE2...;`
- 追加内容：`append KEY 追加内容;`
- 取得数据长度：`strlen KEY;`
- 删除指定数据：`del KEY KEY KEY;`

## hash 类型

- hdel key field1, field2,... 删除一个或多个哈希表字段
- hexists key field 查看哈希表 key 中，指定的字段是否存在。
- hget key field 获取存储在哈希表中指定字段的值
- hincrby key field increment 为哈希表 key 中的指定字段的整数值加上增量 increment
- hincrbyfloat key field increment 为哈希表 key 中的指定字段的浮点数值加上增量 increment
- hkeys key 获取所有哈希表中的字段
- hvals key 获取所有哈希表中的内容
- hgetall key 获取在哈希表中指定 key 的所有字段和值
- hlen key 获取哈希表中字段的数量
- hmget key field1, field2,... 获取所有给定字段的值
- hmset key field1 value1, field2 value2,... 同时将多个 field-value (域-值)对设置到哈希表 key 中
- hset key field value 将哈希表 key 中的字段 field 的值设为 value
- hsetnx key field value 只有在字段 field 不存在时，设置哈希表字段的值
- hvals key 获取哈希表中所有值
- hscal key cursor 迭代哈希表中的键值对

hash 类型可以与一个对象相转换

## 数字类型

- 普通数据类型：
  - 自增处理：`incr key`
  - 自增指定数据：`incrby key 数字`
  - 自减处理：`decr key`
  - 自减指定数据：`decrby key 数字`
- Hash 数据类型
  - 增加：`hincrby key field increment`

## List 数据类型（栈）

- 向集合中存放数据：`lpush key ele1 ele2, ...`
- 取得指定索引位置的所有内容：`lrange key start end`
- 从尾部保存元素：`rpush key ele1, ele2, ...`
- 在指定元素前追加内容：`linsert key before ele ele-new`
- 修改指定索引的内容：`lset key index val`
- 删除数据：`lrem key count ele`
- 保留指定范围的数据：`ltrim key start end`，不在该范围的将被删除
- 元素出栈：`lpop key`，`rpop key`
- 元素出栈到另一个集合：`rpoplpush key key2`
- 取得元素指定索引的内容：`lindex key index`
- 取得集合个数：`llen key`

## Set 数据类型

- 向集合追加元素：`sadd key ele1 ele2`
- 查询 set 集合：`smemebers key`
- 删除集合元素：`srem key`
- 从集合中随机弹出一个元素：`spop key`
- 返回两个集合的差集：`sdiff key1 key2`
- 保存差集运行结果到其他集合：`sdiffstore key1 key2 key3`
  - 保存`key2`和`key3`的差集保存至`key1`中
- 交集：`sinter key1 key2`
- 保存交集运行结果到其他集合：`sinterstore key1 key2 key3`
  - 保存`key2`和`key3`的交集保存至`key1`中
- 并集：`sunion key1 key2`
- 保存并集运行结果到其他集合：`sunionstore key1 key2 key3`
  - 保存`key2`和`key3`的并集保存至`key1`中
- 弹出数据到另外的集合中：`smove key1 key2 ele`
  - 将`key1`中的`ele`弹出到`key2`
- 集合元素个数：`scard key`
- 集合中是否包含某元素：`sismemeber key ele`
- 随机返回集合中的数据：`srandmember key count`
  - `count`指随机返回数据的个数

## SortedSet 数据类型

- 增加数据：`zadd key score ele`
  - `score`指该元素的分数
- 取出有序集合数据
  - 显示所有元素：`zrange key 0 -1`
  - 显示元素及其对应分数：`zrange key 0 -1 withscores`
- 删除元素：`zrem key ele`
- 元素分数增长：`zincryby key scoreadd ele`
- 取得指定元素的索引：`zrank key ele`
- 数据反转处理后取得索引：`zrevrank key ele`
- 数据反转处理后取得数据：`zrevrange key start end withscores`
- 根据分数范围取得数据：`zrangebyscore key from end withscores`
  - 默认为闭区间，开区间为：`zrangebyscore key (from (end withscores`
  - 设置索引范围：`zrangebyscore key from end withscores limit start end`
- 取得指定分数范围的数据个数：`zcount key start end`
- 取得元素数量：`zcard key`
- 根据索引下标删除数据：`zremrangebyrank key start end`
