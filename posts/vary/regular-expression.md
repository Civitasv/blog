---
title: "正则表达式基本使用"
summary: "正则表达式是对搜索和替换功能的扩展，允许使用者使用预先设定的搜索语法匹配给定文本中的字符串"
date: "2021-09-07"
author: "Civitasv"
categories:
  - cs
tags:
  - regular expressions
  - 字符串
---

正则表达式是对搜索和替换功能的扩展，允许使用者使用预先设定的搜索语法匹配给定文本中的字符串。目前高级编程语言如 C、C++、Java、Python、JavaScript 等主流语言均支持正则表达式。

因此，本文将正则表达式作为一种独立的技术进行介绍，对于具体的语言，尽管其实现略有不同，但其核心思想都是相似的。

使用普通搜索功能时，我们必须完整的写出想要匹配的字符串，如假设搜索 abc，必须输入 abc，在编写代码时我们经常使用这种方式寻找方法名所在位置，但如果想要获取文本中出现的所有以 a 开头的字符串，获取经纬度数据等，普通搜索方式就显得力不从心了，而正则表达式在普通搜索功能的基础上，提供了基于模式/规则的匹配，可以允许我们灵活的搜索文本。

## 元字符

如果把正则表达式当作一种语言，元字符就相当于英语中的字母，它是正则表达式的基础。

| 语法 |              意义              |
| :--: | :----------------------------: |
|  .   |            任何字符            |
|  \s  |              空格              |
|  \S  |             非空格             |
|  \d  |           阿拉伯数字           |
|  \D  |          非阿拉伯数字          |
|  \w  | 字母、数字或下划线 a-z A-Z 0-9 |
|  \W  |      非字母、数字或下划线      |
|  \v  |          纵向空白字符          |
|  \   |       按文本形式处理字符       |

由于字符 **.[{()\^$|?\*+** 有特殊含义，在搜索该字符时需要使用`\`进行转义。

## 字符组合

使用 **[]** 或 **|** 可以进行字符的组合。

|  语法  |        意义        |
| :----: | :----------------: |
| [abc]  |  匹配 a 或 b 或 c  |
| [^abc] | 匹配非 a 或 b 或 c |
| [a-z]  |    匹配 a 到 z     |
|  a\|b  |    匹配 a 或 b     |

## 数量词修饰

元字符和字符组合只是对单字符的匹配，数量词修饰符则允许我们定义字符出现的次数，数量词修饰符跟随正则表达式，表示该表达式出现的次数，如**a\***表示 a 出现 0 次或多次，**a{3}**表示 a 出现 3 次。

| 语法  |     意义      |
| :---: | :-----------: |
|  \*   |  0 个或多个   |
|   ?   |  0 个或 1 个  |
|   +   |  1 个或多个   |
|  {n}  |     n 个      |
| {n,}  | 大于等于 n 个 |
| {a,b} |   a 到 b 个   |
| {,b}  |   0 到 b 个   |
| {a,}  |   大于 a 个   |

## 模式

模式用于控制正则表达式的匹配逻辑。

| 语法 |                               意义                                |
| :--: | :---------------------------------------------------------------: |
|  g   |                    全局模式，会获取所有匹配项                     |
|  m   |                 多行模式，此时^和$表示行首和行尾                  |
|  i   |                           不区分大小写                            |
|  s   | 单行模式，此时输入的文本会被作为一行处理，元字符 . 可以匹配换行符 |
|  u   |                  支持 unicode，Python 3 默认模式                  |
|  a   |                       仅支持匹配 AscII 字符                       |

## 特殊

| 语法 |                  意义                  |
| :--: | :------------------------------------: |
|  ^   | 匹配字符串开头，在多行模式下，表示行首 |
|  $   | 匹配字符串结尾，在多行模式下，表示行尾 |
|  \A  |             匹配字符串开头             |
|  \Z  |             匹配字符串结尾             |
|  \b  |                单词边界                |
|  \B  |               非单词边界               |
|  ()  |                  分组                  |

## 示例

### A. 电话

```txt
13482677636
01013421984671
13496851339
13489547460
13423305780
13417379430
13565732107
```

问题：每一行是一个手机号码，如何获得**合法**的以**134**开头的所有手机号码？

答案：**^134\[0-9\]{8}$ \gm**，需要注意应选择 global 和 multiline 模式，此时 **^** 和 **$** 表示行首和行尾，从而排除手机号 **01013421984671**。

### B. 邮箱

```txt
qokuve.vdnaftvpt@265.com
sotvkh@eyou.com
wvvbbuw@sohu.com
lsbwdrbn@sogou.com
faclcgjaebdhp@35.com
hmshsbtoulnriw@hotmail.com
weela@xinhuanet.net
jquvvfafp@21cn.com
nrlrauj@263.net
Charl.Brian@whu.edu.cn
```

问题：如何获取所有域名为 **com** 或 **edu.cn** 的邮箱，并获取其用户名和域名？

答案：**^(\[a-zA-Z\\.\]+)@\[a-zA-Z0-9\]+\\.(com|edu\\.cn)$ \gm**，需要注意应选择 global 和 multline 模式，原因同上，同时，为获取其用户名和域名，需要将用户名和域名使用 **()** 进行分组。

### C. 经纬度

```txt
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "id": "B0FFG7STOJ",
                "name": "肯德基(中央路店)",
                "type": "餐饮服务;快餐厅;肯德基",
                "typecode": "050301",
                "address": "中央北路发达广场1层",
                "tel": "4009208801",
                "pname": "内蒙古自治区",
                "cityname": "呼伦贝尔市",
                "adname": "扎兰屯市"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    122.749107,
                    47.997982
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "id": "B01C4021JK",
                "name": "肯德基(中瑞店)",
                "type": "餐饮服务;快餐厅;肯德基",
                "typecode": "050301",
                "address": "西二道街92号中瑞时代广场1层",
                "tel": "0452-2469201;0452-2423543",
                "pname": "黑龙江省",
                "cityname": "齐齐哈尔市",
                "adname": "建华区"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    123.953001,
                    47.350698
                ]
            }
        }
    ]
}
```

问题：获取 GeoJSON 字符串中的所有经纬度？

答案：**(\d{1,3}\\.\d+),\v?\s\*(\d{1,3}\\.\d+)**，注意经纬度分布在两行，因此不能使用 **^** 和 **$**，同时，需要注意对元字符 **.** 进行转义，对经度和纬度分别分组。
