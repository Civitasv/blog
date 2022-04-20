---
title: "YARN（MapReduce V2）"
summary: "Hadoop 2.x版本针对MapReduce V1版本中性能低下的缺陷进行了优化，推出了YARN分析框架"
date: "2021-02-19"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

`Hadoop 2.x`版本针对`MapReduce V1`版本中性能低下的缺陷进行了优化，推出了`YARN`分析框架。

## YARN 执行分析

`MapReduce`中会出现以下几种问题：

- `JobTracker`单点瓶颈：所有的`Job`管理以及资源的处理调度都需要使用`JobTracker`完成，所以如果多个任务并发执行，会造成`JobTracker`崩溃
- `TaskTracker`在进行作业分配时处理过于简单，可能出现许多消耗时间长的`task`被分配到了一个节点之下，也即无法进行动态的节点分配
- 作业延迟性高，在`MapReduce`作业运行之前，`TaskTracker`必须获取`MapReduce`任务之后才可以开始运行，这样会造成通讯的延迟问题，导致作业量小的`Job`无法及时完成

在`MapReduce V2`版本中，其主要思想是将`JobTracker`进行拆分为集群资源管理和作业管理两个部分。

![YARN改进](/img/in-post/hadoop/YARN改进.png)

YARN 最大的特点是将作业执行与资源调度进行有效的分割，以达到更快、更好的处理速度。
