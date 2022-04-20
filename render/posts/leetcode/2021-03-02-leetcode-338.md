---
title: "比特位计数"
summary: "给定一个非负整数 num。对于 0 ≤ i ≤ num 范围中的每个数字 i ，计算其二进制数中的 1 的数目并将它们作为数组返回"
date: "2021-03-02"
author: "Civitasv"
categories:
  - leetcode 
tags:
  - leetcode
---

## 问题重述

> 给定一个非负整数 num。对于 0 ≤ i ≤ num 范围中的每个数字 i ，计算其二进制数中的 1 的数目并将它们作为数组返回。

**示例 1:**

```java
输入: 2
输出: [0,1,1]
```

**示例 2:**

```java
输入: 5
输出: [0,1,1,2,1,2]
```

## 分析

数字`n`分为奇数和偶数：

- 若`n`为奇数，即`n = 2k+1`，则有`n = k<<2+1`，因此`bits(n) = bits(k)+1`
- 若`n`为偶数，即`n = 2k`，则有`n = k<<2`，因此`bits(n) = bits(k)`
- `bits(0) = 0`

## 代码

```java
public int[] countBits(int num) {
    int[] dp = new int[num + 1];
    dp[0] = 0;
    for (int i = 0; i <= num; i++) {
        if (i % 2 == 0)
            dp[i] = dp[i / 2];
        else dp[i] = dp[i / 2] + 1;
    }
    return dp;
}
```

时间复杂度：`O(n)`

空间复杂度：`O(n)`
