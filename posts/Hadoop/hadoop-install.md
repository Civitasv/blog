---
title: "Hadoop 安装与测试"
summary: "介绍Linux下Hadoop的安装方式"
date: "2021-02-08"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

1. 首先从官网下载 hadoop 安装包，然后使用 ftp 工具上传到 Linux 系统之中；

2. 解压缩到/usr/local 之中；

3. 重命名为`hadoop`；

4. 修改环境属性将`hadoop`主目录及相关的可执行目录配置到文件`/etc/profile`中

   - /usr/local/hadoop
   - /usr/local/hadoop/sbin
   - /usr/local/hadoop/bin

5. 使配置文件立即生效

6. 在`hadoop`配置文件中定义`JAVA_HOME`：`/usr/local/hadoop/etc/hadoop/hadoop-env.sh`，修改`JAVA_HOME`属性为`/usr/local/jdk`

7. 此时检测当前的 Hadoop 是否可以使用，运行其中的一个配置程序（此程序的主要功能是进行单词统计）
   - 为了进行检测，建立一个数据的测试目录：`mkdir -p /usr/test/hadoop/input`
   - 将`/usr/local/hadoop`下的所有 txt 文件拷贝到测试目录中：`cp /usr/local/hadoop/*.txt /usr/test/hadoop/input`
   - 下面使用上面拷贝的 txt 文件进行单词统计
   - 运行：`/usr/test/hadoop/input# hadoop jar /usr/local/hadoop/share/hadoop/mapreduce/sources/hadoop-mapreduce-examples-2.10.1-sources.jar org.apache.hadoop.examples.WordCount /usr/test/hadoop/input /usr/test/hadoop/output`即可进行统计
   - output 目录下的`part-r-00000`文件即是统计结果
