---
title: "至少有K个重复字符的最长子串"
summary: "找到给定字符串（由小写字符组成）中的最长子串 T ，  要求  T  中的每一字符出现次数都不少于 k 。输出 T  的长度"
date: "2021-02-27"
author: "Civitasv"
categories:
  - leetcode 
tags:
  - leetcode
---

## 问题重述

> 找到给定字符串（由小写字符组成）中的最长子串 T ，  要求  T  中的每一字符出现次数都不少于 k 。输出 T  的长度。

**示例 1:**

```java
输入:
s = "aaabb", k = 3
输出:
3
最长子串为 "aaa" ，其中 'a' 重复了 3 次。
```

**示例 2:**

```java
输入:
s = "ababbc", k = 2
输出:
5
最长子串为 "ababb" ，其中 'a' 重复了 2 次， 'b' 重复了 3 次。
```

## 分析

本题是典型的分治法的应用，分治算法将问题递归的分解成简单子问题进行求解，在快速排序、归并排序、句法分析等问题中有着广泛的应用，其主要分为两个阶段：

- Divide 阶段：将问题分为子问题；
- Conquer 阶段：独立的求解子问题，然后将子问题的解合并求解原问题。

因此，对于本题目，我们可以应用分治思想，递归的将字符串分解成子字符串，将结果组合起来得到最终求解的结果。

要想使用分治法，需要找到分治点，首先找到不满足要求的字符（对于本题目**不满足要求**指该字符出现的次数小于`k`），然后按其所在位置进行分割为子字符串，最后结合各个解得到最终结果即可，可以表示为：

```java
longestSubstring(s, k,start,end) =
max(longestSubstring(s,k,start,index), longestSubstring(s, k, index+1,end))
```

## 算法

1. 获取字符串`s`中各个字母出现的次数；
2. 获取字符串`s`中不合法字符出现的索引`split`；
3. 若不存在分割点`split`，则结果为子字符串长度；
4. 否则按`split`进行分割，递归获取结果

### 代码

```java
public int longestSubstring(String s, int k) {
    if (k == 1)
        return s.length();
    return longestSubstring(s, k, 0, s.length() - 1);
}

private int longestSubstring(String s, int k, int start, int end) {
    if (end - start + 1 < k) return 0; // 如果s的长度小于k，那么返回0
    int[] alphabets = new int[26];
    for (int i = start; i <= end; i++)
        alphabets[s.charAt(i) - 'a']++;
    char split = 0;
    for (int i = start; i <= end; i++) {
        int alphabet = alphabets[s.charAt(i) - 'a'];
        if (alphabet > 0 && alphabet < k) {
            split = s.charAt(i);
            break;
        }
    }
    if (split == 0) // 不需要分治
        return end - start + 1;
    int l = start;
    int res = 0;
    while (l <= end) {
        while (l <= end && s.charAt(l) == split) // 跳过所有等于split的
            l++;
        int a = l;
        while (l <= end && s.charAt(l) != split) // 得到不等于split的子字符串
            l++;
        int len = longestSubstring(s, k, a, l - 1);
        res = Math.max(res, len);
    }
    return res;
}
```

时间复杂度：`O(n^2)`，其中`n`为字符串`s`的长度

空间复杂度：`O(n)`

## 参考

[leetcode solution](https://leetcode.com/problems/longest-substring-with-at-least-k-repeating-characters/solution/)
