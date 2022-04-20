---
title: "猜字谜"
summary: "大家一起猜字谜！"
date: "2021-02-26"
author: "Civitasv"
categories:
  - leetcode 
tags:
  - leetcode
---

## 问题重述

字谜分为谜面`puzzle`和谜底`word`，当`word`同时满足以下两个条件： + `word`中包含`puzzle`的第一个字母； + `word`中的每一个字母都可以在`puzzle`中找到

此时`word`即为`puzzle`的其中一个谜底。

题目中给出谜面`puzzles`数组和谜底`words`数组，需要返回`answers`数组，其中`answers[i]`表示在`words`数组中可作为谜面`puzzles[i]`的谜底的数目。

限定条件：

- 1 <= words.length <= 10^5
- 4 <= words[i].length <= 50
- 1 <= puzzles.length <= 10^4
- puzzles[i].length == 7
- words[i][j], puzzles[i][j]  都是小写英文字母
- puzzles[i]  所包含的字符都不重复。

## 分析

我们最容易想到的方法是对于每一个`puzzle`，遍历`words`数组，得到符合条件的谜底数目，但`1 <= words.length <= 10^5,1 <= puzzles.length <= 10^4`，时间复杂度将达到`O(10^9)`，显然会超出时间限制。

谜底所必须的第二个条件中指出`word`中的每一个字母都可以在`puzzle`中找到，注意此处是字母，而不是每一个字符，即`aaa`和`aa`所表示的谜底事实上是等同的，如果我们对所有谜底进行编码，那么这两个谜底所对应的编码应该是相同的。换句话说，我们需要找到一种编码方式对所有谜底`words`进行编码，使用哈希储存每一个编码出现的次数即每一种谜底出现的次数。本题中一种比较合适的编码方式是二进制编码，显然该二进制的最大位数为 26。

条件中指出`puzzle`的长度为 7，那么遍历其全部子集在时间上是可行的，由于`word`必须包含`puzzle`的第一个字母，因此`puzzle`的子集中的所有字符串必须以`puzzle`的第一个字母开头，因此`puzzle`显然有`2^6`个子集，对于子集中的每一个字符串，计算其二进制编码，我们已提前存储了谜底`words`所有编码出现的次数，因此容易得到该二进制编码在谜底`words`中出现的次数也即`puzzle`对应的`word`的数组。

## 求解

分析中存在两个难点：二进制编码和遍历子集。

### 二进制编码

`a`->`0001`
`ab`->`0011`
`abc`->`0111`
`abcf`->`00100111`

二进制编码的过程事实上就是一个填数的过程，我们可以使用或运算和位运算，若以`bs`表示其二进制编码，遍历`word`的字符`w`之后，其值应变为`bs|(1<<w-'a')`

代码如下：

```java
int bs = 0;
for (int i = 0; i < word.length(); i++) {
    bs |= (1 << word.charAt(i) - 'a');
}
```

### 遍历子集

对于谜面`abcdefg`来说，其子集的数目应为：`2*2*2*2*2*2`，此处的每一个`2`表示该字符**存在或不存在**的两种可能性。

那么我们可以将**存在**表示为 1，**不存在**表示为 0，则可以使用**000000**表示子字符串`a`，**000001**表示子字符串`ag`...**111111**表示子字符串`abcdefg`

那么我们就可以得到遍历子集的代码：

```java
for (int c = 0; c < 64; c++) {
    int bs = 0;
    for (int i = 0; i < 6; ++i) {
        if ((c & (1 << i)) != 0) {
            bs |= (1 << (puzzle.charAt(6 - i) - 'a'));
        }
    }
    bs |= (1 << (puzzle.charAt(0) - 'a'));
}
```

### 代码

```java
public List<Integer> findNumOfValidWords(String[] words, String[]puzzles) {
    Map<Integer, Integer> map = new HashMap<>();
    for (String word : words) {
        int bs = 0;
        for (int i = 0; i < word.length(); i++) {
            bs |= (1 << word.charAt(i) - 'a');
        }
        // 如果mask的1位数超过7，一定无法作为谜底
        if (Integer.bitCount(bs) <= 7)
            map.put(bs, map.getOrDefault(bs, 0) + 1);
    }
    List<Integer> result = new ArrayList<>();
    for (String puzzle : puzzles) {
        int count = 0;
        // 枚举，第一个字符不变，其它6个字符枚举，共2^6种
        for (int c = 0; c < 64; c++) {
            int bs = 0;
            for (int i = 0; i < 6; ++i) {
                if ((c & (1 << i)) != 0) {
                    bs |= (1 << (puzzle.charAt(6 - i) - 'a'));
                }
            }
            bs |= (1 << (puzzle.charAt(0) - 'a'));
            count += map.getOrDefault(bs, 0);
        }
        result.add(count);
    }
    return result;
}
```

时间复杂度：`O(mw+64n)`，其中`m`为`words`数组的长度，`w`为`word`的长度，`n`为`puzzles`数组的长度

空间复杂度：`O(m)`
