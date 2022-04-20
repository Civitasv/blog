---
title: "MapReduce V1执行分析"
summary: "对MapReduce V1版本进行简单介绍"
date: "2021-02-18"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

之前使用的`MapReduce`均属于 V1 版本，也是`Hadoop`最初的推出的操作版本。

`V1`和`V2`版本的区别主要在于执行流程不同。

![MapReduce执行流程](/img/in-post/hadoop/MapReduce执行流程.png)

在`MapReduce`处理流程中 Map 阶段和 Reduce 阶段都会有若干个线程对象进行操作控制，这将伴随大量的资源开销。

`MapReduce`处理流程如下：

- 对输入数据进行切片处理
- 由`Master`调用`Worker`执行`Map`任务，`Worker`会通过数据源读取片段数据
- `Worker`执行`Map`任务，并将任务的输出保存至本地磁盘
- `Master`调度`Worker`执行`Reduce`任务，该任务会读取`Map`任务的输出文件
- `Worker`执行`Reduce`任务，将任务的输出保存至`HDFS`之中

![MapReduce执行分析](/img/in-post/hadoop/MapReduce执行分析.png)

从图中可以看出`MapReduce`执行过程中，`JobTracker`与`TaskTracker`面临着各种资源的分配处理，同时还需要进行具体的数据运算，这导致了传统的`MapReduce`执行性能不高，因此这样的`MapReduce`被称为`V1`版本。
