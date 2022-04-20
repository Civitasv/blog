---
title: "Java的基本程序设计结构"
summary: "Java 数据类型介绍 "
date: 20"20-12-17"
author: "Civitasv"
categories:
  - CoreJAVAVolume I
tags:
  - Java核心技术卷I
---

## 一个简单的 Java 应用程序

```java
public class First{
    public static void main(String[] args){
        System.out.println("hello world");
    }
}
```

需要注意命名：类首字母大写、驼峰命名、方法名首字母小写...

## 数据类型

Java 是一种强类型语言，共有八种基本类型，包括 4 种整型、2 种浮点类型、1 种字符类型和 1 种表示真值的布尔类型。

### 整型

| 类型  | 存储需求 |         取值范围         |
| :---: | :------: | :----------------------: |
|  int  |  4 字节  | -$2^{31}$ ~ $2^{31}$ - 1 |
| short |  2 字节  | -$2^{15}$ ~ $2^{15}$ - 1 |
| long  |  8 字节  | -$2^{63}$ ~ $2^{63}$ - 1 |
| byte  |  1 字节  |     -$2^7$ ~ $2^7$-1     |

Java 与 C/C++语言不同，字节大小与所运行机器无关，不需要使用`sizeof()`函数进行判断。从 Java 7 开始，加上前缀`0b`或`0B`可以表示二进制数，还可以为数字字面量添加下划线，如`1_000_000`就表示`1000000`。

### 浮点类型

|  类型  | 存储需求 |                 取值范围                 |
| :----: | :------: | :--------------------------------------: |
| float  |  4 字节  |       大约 $\pm$ 3.403 823 47E+38F       |
| double |  8 字节  | 大约 $\pm$ 1.797 693 134 862 315 70E+308 |

```java
0/0 = NAN
x/0 = 正无穷大(x instance of int)
if(x == Double.NaN) // nerver true
if(Double.isNaN(x)) // check if x is NaN
```

二进制数无法精确表示 1/10 的值，因此会有舍入误差。就像十进制无法准确表示 1/3 一样。

### char 类型

2 字节。

Java 中，char 类型描述了 UTF-16 编码中的一个代码单元（`code unit`）。

### boolean 类型

false or true.

大小不确定。

> The boolean data type has only two possible values: true and false. Use this data type for simple flags that track true/false conditions. This data type represents one bit of information, but its "size" isn't something that's precisely defined.
