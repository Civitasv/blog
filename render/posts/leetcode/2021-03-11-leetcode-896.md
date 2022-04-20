---
title: "单调数列"
summary: "单调数列计算"
date: "2021-03-11"
author: "Civitasv"
categories:
  - leetcode 
tags:
  - leetcode
---

## 问题重述

> 如果数组是单调递增或单调递减的，那么它是单调的。  
> 如果对于所有 i <= j，A[i] <= A[j]，那么数组 A 是单调递增的。 如果对于所有 i <= j，A[i]> = A[j]，那么数组 A 是单调递减的。  
> 当给定的数组 A  是单调数组时返回 true，否则返回 false。

**示例 1:**

```java
输入：[1,2,2,3]
输出：true
```

**示例 2:**

```java
输入：[6,5,4,4]
输出：true
```

**限定条件：**

- 1 <= A.length <= 50000
- -100000 <= A[i] <= 100000

## 分析

本题不难理解，但需要注意该题并非要求数组严格递增/严格递减，需要注意`A[i] = A[i + 1]`的情况，我们可以使用`up`和`down`变量分别表示数组单调递增和递减，在一次遍历中更新`up`和`down`的值，最后返回`up || down`即可，其中`up = up && A[i] <= A[i + 1]`，`down = down && A[i] >= A[i + 1]`。

## 代码

```java
public boolean isMonotonic(int[] A) {
    if (A.length == 1)
        return true;
    boolean down = true;
    boolean up = true;
    for (int i = 0; i < A.length - 1; i++) {
        down = down && (A[i + 1] >= A[i]);
        up = up && (A[i + 1] <= A[i]);
    }
    return down || up;
}
```

时间复杂度：`O(n)`，其中`n`为数组`A`的长度

空间复杂度：`O(1)`
