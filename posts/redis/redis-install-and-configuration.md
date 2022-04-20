---
title: "Redis安装与配置"
summary: "如果想要使用 Redis，就必须进行代码的编译处理，下面在 Linux 环境下进行编译安装"
date: "2021-03-07"
author: "Civitasv"
categories:
  - redis 
tags:
  - redis
---

## Redis 安装

如果想要使用 Redis，就必须进行代码的编译处理，下面在`Linux`环境下进行编译。

1. 使用`ftp`服务上传至`linux`服务器（注意阿里云服务器要开放安全组）；
2. 解压缩：`tar xzvf /srv/ftp/redis-6.2.1.tar.gz /usr/local/src`
3. 进入`Redis`源代码所在目录：`cd /usr/local/src/redis-6.2.1/`
4. 编译：`make`
5. 编译完成之后进行`Redis`的安装：`make install`
6. `Redis`属于内存缓存数据库，那么如果现在是一台单独的`Redis`服务器，则应该考虑将所有的可用内存都交给`Redis`支配，理论上还需要执行：`echo "vm.overcommit_memory=1">>/etc/sysctl.conf`，`vm.overcommit_memory`有三个取值：
   - 0：表示在进行处理的时候首先要检查是否有足够的内存供应，如果没有足够的内存则申请失败，如果有可用内存则进行申请开辟；
   - 1：表示将所有的内存都交给应用使用，而不关心当前的内存状态如何；
   - 2：表示允许分配超过所有物理内存和交换空间的内存的总和。
7. 将以上的配置写入到内核参数之中：`/sbin/sysctl -p`
8. 为了方便使用`Redis`数据库，需要建立一个`Redis`的命令工具目录：`mkdir -p /usr/local/redis/{bin,conf}`
   - `cp /usr/local/src/redis-6.2.1/src/redis-server /usr/local/redis/bin/`：拷贝`Redis`服务启动程序
   - `cp /usr/local/src/redis-6.2.1/src/redis-cli /usr/local/redis/bin/`：拷贝`Redis`命令行客户端
   - `cp /usr/local/src/redis-6.2.1/src/redis-benchmark /usr/local/redis/bin/`：性能测试工具
   - `cp /usr/local/src/redis-6.2.1/redis.conf /usr/local/redis/conf/`：配置文件

此时当前的`Redis`数据库的所有程序文件已经安装成功。

## Redis 配置

主要的配置文件：`redis.conf`

1. 配置数据存储目录，Redis 运行时有三类文件需要保存：

   - Redis 运行时的 pid
   - Redis 相关处理日志
   - Redis 的数据文件

   执行命令：`mkdir -p /usr/data/redis/{run,logs,dbcache}`

2. 修改`redis.conf`配置文件

   - 配置绑定 ip：`bind 127.0.0.1`，注销即表示允许远程连接
   - 配置 Redis 运行端口：`port 6379`
   - 配置 Redis 是否为后台运行：`daemonize yes`
   - 配置进程保存路径：`pidfile /usr/data/redis/run/redis_6379.pid`
   - 配置日志保存路径：`logfile "/usr/data/redis/logs/redis.log"`
   - 配置 database 数量：`databases 16`
   - 配置 Redis 数据文件目录：`dir /usr/data/redis/dbcache`

3. 启动 redis 服务：`/usr/local/redis/bin/redis-server /usr/local/redis/conf/redis.conf`

4. Redis 启动会占用端口 6379，可以使用`netstat -nptl`查看该端口是否启动

5. 启动 redis 客户端

   - 连接本机：`/usr/local/redis/bin/redis-cli`
   - 连接远程 ip：`/usr/local/redis/bin/redis-cli -h ip -p 6379`

6. 设置数据：`set key value`

7. 获得数据：`get key`

8. 关闭 Redis 服务：`killall redis-server`
