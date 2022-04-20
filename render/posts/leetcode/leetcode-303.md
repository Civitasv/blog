---
title: "区域和检索 - 数组不可变"
summary: "给定一个整数数组  nums，求出数组从索引 i 到 j（i ≤ j）范围内元素的总和，包含 i、j 两点"
date: "2021-03-05"
author: "Civitasv"
categories:
  - leetcode 
tags:
  - leetcode
---

## 问题重述

> 给定一个整数数组  nums，求出数组从索引  i  到  j（i ≤ j）范围内元素的总和，包含  i、j  两点。  
> 实现 NumArray 类：

1. NumArray(int[] nums) 使用数组 nums 初始化对象
2. int sumRange(int i, int j) 返回数组 nums 从索引  i  到  j（i ≤ j）范围内元素的总和，包含  i、j  两点（也就是 sum(nums[i], nums[i + 1], ... , nums[j])）

**示例:**

```java
输入：
["NumArray", "sumRange", "sumRange", "sumRange"]
[[[-2, 0, 3, -5, 2, -1]], [0, 2], [2, 5], [0, 5]]
输出：
[null, 1, -1, -3]

解释：
NumArray numArray = new NumArray([-2, 0, 3, -5, 2, -1]);
numArray.sumRange(0, 2); // return 1 ((-2) + 0 + 3)
numArray.sumRange(2, 5); // return -1 (3 + (-5) + 2 + (-1))
numArray.sumRange(0, 5); // return -3 ((-2) + 0 + 3 + (-5) + 2 + (-1))
```

**限定条件：**

- 0 <= nums.length <= 104
- -105 <= nums[i] <= 105
- 0 <= i <= j < nums.length
- 最多调用 104 次 sumRange 方法

## 分析

最朴素的想法是在每次调用`sumRange`函数时对数组索引`i`到`j`循环求和，但若反复调用`sumRange`函数，程序显然会超时。

因此，我们可以使用空间换时间，提前缓存`sumRange(0,k)`，定义`sumRange(0,k)`：

$$
sumRange(0,k) = \begin{cases}
  \sum_{i=0}^{k-1}, & k>0 \\
  0, & k = 0
\end{cases}
$$

那么显然有：

$$
sumRange(i,j) = sumRange(0,j+1) - sumRange(0,i)
$$

## 代码

```java
class NumArray {
    private final int[] sum;

    public NumArray(int[] nums) {
        int n = nums.length;
        sum = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            sum[i] = sum[i - 1] + nums[i - 1];
        }
    }

    public int sumRange(int i, int j) {
        return sum[j + 1] - sum[i];
    }
}
```

时间复杂度：提前计算前缀和时间复杂度为`O(n)`，调用`sumRange`函数时间复杂度为`O(1)`

空间复杂度：`O(n)`
