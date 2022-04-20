---
title: "二维区域和检索 - 矩阵不可变"
summary: "给定一个二维矩阵，计算其子矩形范围内元素的总和，该子矩阵的左上角为 (row1, col1) ，右下角为 (row2, col2)"
date: "2021-03-05"
author: "Civitasv"
categories:
  - leetcode 
tags:
  - leetcode
---

## 问题重述

> 给定一个二维矩阵，计算其子矩形范围内元素的总和，该子矩阵的左上角为 (row1, col1) ，右下角为 (row2, col2)。  
> 实现 NumMatrix 类：

1. NumArray(int[][] matrix ) 使用矩阵 matrix 初始化对象
2. int sumRegion(int row1, int col1, int row2, int col2) 返回矩阵 matrix 从左上角 (row1, col1) 到右下角(row2, col2) 范围内元素的总和，包含  (row1, col1)、(row2, col2)  两点

**示例:**

```java
给定 matrix = [
  [3, 0, 1, 4, 2],
  [5, 6, 3, 2, 1],
  [1, 2, 0, 1, 5],
  [4, 1, 0, 1, 7],
  [1, 0, 3, 0, 5]
]

sumRegion(2, 1, 4, 3) -> 8
sumRegion(1, 1, 2, 2) -> 11
sumRegion(1, 2, 2, 4) -> 12
```

**说明：**

1. 你可以假设矩阵不可变。
2. 会多次调用 sumRegion 方法。
3. 你可以假设 row1 ≤ row2 且 col1 ≤ col2。

## 分析

本题是题目**303. 区域和检索 - 数组不可变**的变型，也可使用前缀和思想进行求解，我们可以首先计算矩阵原点`(0, 0)`到`(i, j)`的元素和`sumRegion(O, P)`并进行缓存用以求解`(row1, col1)`到`(row2, col2)`的元素和，如下图：

![区域ABCD](/img/in-post/leetcode/二维区域和检索.png)

显然有：

$$
sumRegion(A, D) = sumRegion(O, D) - sumRegion(O, E) - sumRegion(O, F) + sumRegion(O, G)
$$

注意，`sumRegion(O, E)` 和 `sumRegion(O, F)`均包含`sumRegion(O, G)`，因此需要增加一个`sumRegion(O, G)`

注意以上`sumRegion(p1, p2)`表示`sumRegion(p1.row, p1.col, p2.row, p2.col)`

## 代码

```java
class NumMatrix {
    private int[][] sum; // sum[i+1][j+1] = sumRegion(0,0,i,j)

    public NumMatrix(int[][] matrix) {
        if (matrix.length == 0 || matrix[0].length == 0) return;
        int rows = matrix.length;
        int cols = matrix[0].length;
        sum = new int[rows + 1][cols + 1];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                sum[i + 1][j + 1] = sum[i + 1][j] + sum[i][j + 1] - sum[i][j] + matrix[i][j];
            }
        }
    }

    public int sumRegion(int row1, int col1, int row2, int col2) {
        return sum[row2 + 1][col2 + 1] - sum[row1][col2 + 1] - sum[row2 + 1][col1] + sum[row1][col1];
    }
}
```

注意代码中`sum[i+1][j+1]`表示`sumRegion(0,0,i,j)`，此时不需考虑行列参数为 0 的情况（相当于增加了一行一列）。
![区域ABCD](/img/in-post/leetcode/二维区域和检索2.png)

时间复杂度：提前计算前缀和时间复杂度为`O(mn)`，调用`sumRegion`函数时间复杂度为`O(1)`

空间复杂度：`O(mn)`
