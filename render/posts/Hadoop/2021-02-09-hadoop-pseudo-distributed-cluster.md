---
title: "搭建 Hadoop 伪分布式集群"
summary: "介绍Linux下搭建 Hadoop 伪分布式集群的方式"
date: "2021-02-09"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

核心配置文件：
core-site.xml
hdfs-site.xml
yarn-site.xml

Hadoop 的核心配置文件在`/usr/local/hadoop/etc/hadoop/`文件夹中

## core-site.xml 配置

本配置文件的主要目的是设置 hadoop 的临时保存目录，但该目录不允许使用`/tmp`目录，因为该目录会被自动清空。

1. 建立临时保存路径：`mkdir -p /usr/data/hadoop/tmp`

2. `vi /usr/local/hadoop/etc/hadoop/core-site.xml`

```xml
<configuration>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>/usr/data/hadoop/tmp</value>
        <description></description>
    </property>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://hadoop-alone:9000</value>
    </property>
</configuration>
```

## hdfs-site.xml 配置

1. 建立 namenode 的保存目录：`mkdir -p /usr/data/hadoop/dfs/name`

2. 建立 datanode 的保存目录：`mkdir -p /usr/data/hadoop/dfs/data`

3. `vi /usr/local/hadoop/etc/hadoop/hdfs-site.xml`

```xml
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
    </property>
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:///usr/data/hadoop/dfs/name</value>
    </property>
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:///usr/data/hadoop/dfs/data</value>
    </property>
    <property>
        <name>dfs.namenode.http-address</name>
        <value>hadoop-alone:50070</value>
    </property>
    <property>
        <name>dfs.namenode.secondary.http-address</name>
        <value>hadoop-alone:50090</value>
    </property>
    <property>
        <name>dfs.permissions</name>
        <value>false</value>
    <property>
</configuration>
```

`dfs.replication`：文件保存的副本数量，副本保存在 DataNode 之中，现在只有一个主机，所以只存 1 份

`dfs.namenode.name.dir`：保存 namenode 节点信息的相关操作

`dfs.datanode.data.dir`：保存真实数据

`dfs.namenode.http-address`：hadoop 启动之后会有一个 http 服务，通过浏览器可以访问，访问端口为该值

`dfs.namenode.secondary.http-address`：

`dfs.permissions`：权限操作，设置 false 表示无须验证

## yarn-site.xml 配置

1. `vi /usr/local/hadoop/etc/hadoop/yarn-site.xml`

```xml
<configuration>
    <property>
        <name>yarn.resourcemanager.admin.address</name>
        <value>hadoop-alone:8033</value>
    </property>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
    </property>
    <property>
        <name>yarn.nodemanager.aux-services.mapreduce_shuffle.class</name>
        <value>org.apache.hadoop.mapred.ShuffleHandler</value>
      </property>
    <property>
        <name>yarn.resourcemanager.resource-tracker.address</name>
        <value>hadoop-alone:8025</value>
    </property>
    <property>
        <name>yarn.resourcemanager.scheduler.address</name>
        <value>hadoop-alone:8030</value>
    </property>
    <property>
        <name>yarn.resourcemanager.address</name>
        <value>hadoop-alone:8050</value>
    </property>
    <property>
        <name>yarn.resourcemanager.scheduler.address</name>
        <value>hadoop-alone:8030</value>
    </property>
    <property>
        <name>yarn.resourcemanager.webapp.address</name>
        <value>hadoop-alone:8088</value>
    </property>
    <property>
        <name>yarn.resourcemanager.webapp.https.address</name>
        <value>hadoop-alone:8090</value>
    </property>
</configuration>
```

## 主机信息配置

由于现在属于伪分布式开发环境，所以还需要定义一些主机的信息（从节点）

修改 slaves 配置信息`vi /usr/local/hadoop/etc/hadoop/slaves`，添加`hadoop-alone`，如果有多台主机，则需要添加所有机器

到这里为止，所有配置项就完成了，随后需要对 namenode 节点进行格式化处理：`hdfs namenode -format`

配置完成之后就可以进行`Hadoop`的启动，启动命令路径：`/usr/local/hadoop/sbin`，执行`start-all.sh`即可启动，这是一个最简单的脚本，但并不是推荐使用的操作模式。

有时候启动完成了之后有可能会自己关闭服务，建议使用`jps`命令（列出所有的 Java 进程信息），如果出现六个进程：

```text
4257 DataNode
5185 Jps
4681 ResourceManager
4490 SecondaryNameNode
4828 NodeManager
4078 NameNode
```

则表示配置成功

输入`http://192.168.216.128:50070`或`http://hadoop-alone:50070/`就可以查看首页
