---
title: "分布式文件系统（HDFS）"
summary: "针对于整个 Hadoop 实际上只有两个核心的服务模块：`DFS`（存储）、`YARN`（第二代分析）。对于存储服务模块需要使用`HDFS`进行处理操作"
date: "2021-02-11"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

针对于整个 Hadoop 实际上只有两个核心的服务模块：`DFS`（存储）、`YARN`（第二代分析）。对于存储服务模块需要使用`HDFS`进行处理操作。

## HDFS 简介

FS->File System

DFS->Distributed File System

对于传统的单服务器开发时代，一个非常可怕的问题就是数据的备份问题，随着时间的加长，对于传统数据的备份所需要的时间也越多，整个运维过程之中就会造成严重的系统堵塞问题。

Hadoop 作为大数据时代的先驱者，提出**数据备份三份**的概念。

![Hadoop的数据存储](/img/in-post/hadoop/Hadoop的数据存储.png)

这样以来，数据的备份也不需要了。

所有的数据保存在`DataNode`进程节点的保存，而`NameNode`只是做一个导航的作用，所以如果没有`NameNode`则无法操作`DataNode`节点。

因此，`NameNode`需要大内存，`DataNode`需要大容量。

## NameNode 分析

`NameNode`的核心作用是**引导**，用于索引`DataNode`的位置。

实际开发中，`NameNode`、`SecondaryNameNode`、`DataNode`的架构如下：

![HDFS架构](/img/in-post/hadoop/HDFS架构.png)

当用户上传一个待分析的文件之后，这些数据的信息被`NameNode`所接受，而后这些具体的文件的基本信息都会保存在元数据（`MetaData`）之中，而真正的数据保存在`DataNode`之中，且`NameNode`会记录具体保存在了哪个`DataNode`节点，

需要注意`DataNode`是根据数据块来存储的，如 Hadoop 的默认数据块为 128M，如果此时存储一个 1k 的文件，`DataNode`也会占用 128M 的磁盘空间，如果存储了 300M 的文件，会自动拆分为 3 份，保存在不同的数据块里面。

`SecondaryNameNode`属于`NameNode`的经理级别，负责一些琐碎的事务，负责为`NameNode`进行数据更新，因为`NameNode`可能不是最新的数据，所以需要一个辅助的操作帮助`NameNode`进行更新。

`NameNode`组成：

1. 编辑日志（edits）：记录 HDFS 所有数据更新操作，随着时间的加长，日志文件内容会越来越多，所以`NameNode`之中针对日志会进行新日志切换，保证一个日志的内容不会特别的长
2. 元数据（MetaData）：记录了所有的当前保留下来的文件的相关信息，与 edits 相比是滞后的，是保存在内存上的，确保高效率的运行
3. 文件系统快照（fsimage）：是元数据的持久化保存，与元数据是同步的，滞后于 edits，会保存在磁盘上，在节点宕机后会提供元数据的持久化保存
4. `fstime`：保存最后一次的检查点信息

![NameNode](/img/in-post/hadoop/NameNode.png)

用户如果需要进行`HDFS`操作，操作记录会记录在`edits`文件之中

如果需要进行文件获取，需要通过元数据获取，但由于有可能会出现节点宕机的情况，所以元数据也会持久化保存在磁盘之中，也即是`fsimage`

而后为了保证元数据的内容是最新的，此时就需要`SecondaryNameNode`对元数据进行更新处理。

![SecondaryNameNode工作流程](/img/in-post/hadoop/SecondaryNameNode工作流程.png)

因此`NameNode`和`SecondaryNameNode`必须放在两台主机上，因为这两个节点都需要大内存保证高效率处理。

## HDFS 操作分析

HDFS 是 Hadoop 的文件操作系统，提供了一些可以直接使用的`Shell`命令。

1. 将文件上传到 HDFS 之中：`hadoop fs -put 文件名 /HDFS的路径`，如创建一个 txt 文件：`echo hello world >> info,txt`，将 info.txt 上传到`HDFS`根路径：`hadoop fs -put /usr/local/info.txt /`

   使用 web 浏览器浏览：`http://192.168.216.128:50070/`

   ![HDFS文件上传](/img/in-post/hadoop/HDFS文件上传.png)

   此时该文件的容量非常的小，但是最后会发现会占用 128M 的文件块的空间，所以一定上传要大文件！

   此时使用的是伪分布式集群处理，所有的数据都被保存在`/usr/data/hadoop/dfs/data`目录之中，但这些文件用户其实是无法看见的，所有的信息会被`HDFS`自动命名处理（信息的对应保存在元数据之中）。

   重复的文件名称不允许上传。

   **HDFS 写入流程**如下：

   ![HDFS写入流程](/img/in-post/hadoop/HDFS写入流程.png)

   在整个文件写入的过程中依然需要在`NameNode`之中进行判断（是否已经上传）与注册（添加元数据、记录 edits 等）。

   如果现在要上传的文件大于 128M，那么这些文件将会自动地进行拆分处理，以放在不同的数据块之中，但是用户在获取这个文件的时候完全感受不到文件的拆分过程，因为整体的流程都由`NameNode`节点来控制。

   ![HDFS拆分处理流程](/img/in-post/hadoop/HDFS处理流程.png)

   如果 hadoop 设置了副本数量，则会自动将进行文件的拆分，保存在不同的`DataNode`之中。

   ![数据副本](/img/in-post/hadoop/数据副本.png)

2. 获取文件：`hadoop fs -get /文件路径`，此时的文件会下载到当前目录之中。

   ![HDFS读取流程](/img/in-post/hadoop/HDFS读取流程.png)

   整体的上传要经过`NameNode`进行数据块的信息记录，下载的时候也需要通过`NameNode`取得数据块的位置并且将其下载到本地。

## HDFS Shell 命令

1. 列出根目录下所有文件信息：`hadoop fs -ls /`
2. 在`HDFS`上创建目录：`hadoop fs -mkdir -p /cn/husen/input`
3. 将文件上传到指定的目录之中：`hadoop fs -put /usr/local/info.txt /husen/input`
4. 复制`HDFS`的文件：`hadoop fs -cp /cn/husen/input/info.txt /cn`
5. 删除文件：`hadoop fs -rm /cn/info.txt`
6. 移动文件：`hadoop fs -mv /cn/info.txt /cn/nihao.txt`
7. 删除文件目录：`hadoop fs -rmr /cn`或者`hadoop fs -rm -r /cn`
8. 查看帮助信息：`hadoop fs -help`

## 通过 Java 操作 HDFS

实际运行之中，还是需要使用程序来进行控制。

1. 在`HDFS`上创建一个新的文件目录

   ```java
   public class CreateDirDemo {
       // 测试创建HDFS目录
       public static void main(String[] args) {
           String hdfsUri = "hdfs://192.168.216.128:9000";
           // 需要确定有一个开发包的配置类对象
           Configuration conf = new Configuration();
           // 如果想要创建HDFS目录需要使用FileSystem类
           FileSystem fs = FileSystem.get(URI.create(hdfsUri), conf);
           // 所有的目录都在Path类上进行定义
           Path path = new Path("/input"); // 指定要创建的目录
           boolean result = fs.mkdirs(path); // 创建目录
           System.out.println(result);
       }
   }
   ```

2. 保存文件到`HDFS`中、

   ```java
   public class UploadFileDemo {
       public static void main(String[] args) throws IOException {
           String inputFile = "C:" + File.separator + "AMTAG.BIN";
           String hdfsDir = "/input";
           Path inputPath = new Path(inputFile);// 要上传的文件包装
           Path hdfsPath = new Path(hdfsDir);  // 上传后的保存目录
           String hdfsUri = "hdfs://192.168.216.128:9000";
           // 需要确定有一个开发包的配置类对象
           Configuration conf = new Configuration();
           // 如果想要创建HDFS目录需要使用FileSystem类
           FileSystem fs = FileSystem.get(URI.create(hdfsUri), conf);
           // 所有的目录都在Path类上进行定义
           fs.copyFromLocalFile(inputPath, hdfsPath);
       }
   }
   ```

`Configuration`中可以进行属性配置，配置信息其实就是之前配置的三个配置文件中的。
