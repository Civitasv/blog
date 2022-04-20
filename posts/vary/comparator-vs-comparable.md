---
title: "Comparator vs Comparable"
summary: "如果我们使用第三方 API 且其中的某类未实现 Comparable 接口，我们就可以使用 Comparator 接口定义排序规则"
date: "2021-03-02"
author: "Civitasv"
categories:
  - java 
tags:
  - callback
---

`Collections.sort`函数可以对实现了`Comparable`接口的类直接进行排序

但如果我们使用第三方 API 且其中的某类未实现`Comparable`接口，我们就可以使用`Comparator`接口定义排序规则

如果某类已经实现了`Comparable`接口，但我们想要定义一个完全不同的排序规则，也可以使用`Comparator`接口

简单来说，`Comparable`接口只能定义一个排序规则，实现了`Comparable`接口的类可以直接调用`sort`函数，而使用`Comparator`接口可以定义多个排序规则
