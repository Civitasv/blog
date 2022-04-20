---
title: "Hadoop 启动命令分析"
summary: "介绍Hadoop 进程作用浅析"
date: "2021-02-10"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

## Hadoop 进程作用浅析

使用`start-all.sh`命令启动了 hadoop 相关进程，这些进程分为两类：

- DFS 相关进程（存储）：NameNode、SecondaryNameNode、DataNode；

  - 配置文件：hdfs-site.xml

- YARN 相关进程（数据分析）：ResouceManager、NodeManager；
  - 配置文件：yarn-site.xml

![进程分析](/img/in-post/hadoop/进程分析.png)

如果从最简化的思路进行服务器节点部署，那么部署模式应该为：

![开发部署](/img/in-post/hadoop/开发部署.png)

注意：在之前的伪分布式集群搭建教程中，我们将以上均配置在了一台服务器之中。

## 手动启动 Hadoop 相关进程

在实际的开发过程之中，不会选择使用`start-all.sh`命令，因为它会同时启动`DFS`和`YARN`相关进程，但是从实际来讲，需要分开启动。

1. 启动`namenode`进程，`/usr/local/hadoop/sbin/hadoop-daemon.sh`命令可启动`namenode`进程：`hadoop-daemon.sh start namenode`，会出现以下日志：

   ```text
   starting namenode, logging to /usr/local/hadoop/logs/hadoop-root-namenode-hadoop-alone.out
   ```

2. 启动`SecondaryNameNode`节点：`hadoop-daemon.sh start secondarynamenode`，会出现以下日志：

   ```text
   starting secondarynamenode, logging to /usr/local/hadoop/logs/hadoop-root-secondarynamenode-hadoop-alone.out
   ```

3. 启动`DataNode`节点：`hadoop-daemon.sh start datanode`，会出现一下日志：

   ```text
   starting datanode, logging to /usr/local/hadoop/logs/hadoop-root-datanode-hadoop-alone.out
   ```

4. 查看 hadoop 使用的端口号：`netstat -ntpl`

5. 启动`ResouceManager`进程；`yarn-daemon.sh start resourcemanager`，日志：

   ```text
   starting resourcemanager, logging to /usr/local/hadoop/logs/yarn-root-resourcemanager-hadoop-alone.out
   ```

6. 启动`NodeManager`进程：`yarn-daemon.sh start nodemanager`

   ```text
   starting nodemanager, logging to /usr/local/hadoop/logs/yarn-root-nodemanager-hadoop-alone.out
   ```

7. 停止命令只需要将`start`变为`stop`即可。

## 自动化脚本启动

1. 自动化启动 dfs：`start_dfs.sh`，会启动`NameNode`、`DataNode`、`SecondaryNameNode`

2. 自动化启动 yarn：`start_yarn.sh`，会启动`ResourceManager`、`NodeManager`

3. 自动化关闭 dfs：`stop_dfs.sh`

4. 自动化关闭 yarn：`stop_yarn.sh`
