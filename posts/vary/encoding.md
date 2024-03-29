---
title: "编码"
summary: "人类之间能够交流是因为有文字，文字的意义是具有约定/标准的，当你说“你吃饭了吗”的时候，我不会理解为“你要上厕所吗”便依赖于此。同样的，要想与计算机进行交流，就必须建立一套“双方都明确”的规则，其中便涉及到字符编码"
date: "2021-03-11"
author: "Civitasv"
categories:
  - cs 
tags:
  - encoding
---

## 为什么需要编码

人类之间能够交流是因为有文字，文字的意义是具有约定/标准的，当你说“你吃饭了吗”的时候，我不会理解为“你要上厕所吗”便依赖于此。同样的，要想与计算机进行交流，就必须建立一套“双方都明确”的规则，其中便涉及到字符编码。

## 定义梳理

`ASCII`: 全称 American Standard Code for Information Interchange（美国信息交换标准代码），是基于拉丁字母开发的一套电脑编码系统，用于展示现代英语，等同于国际标准`ISO/IEC 646`。至今共定义了 128（$2^7$）个字符，使用一个字节的后 7 位，第一位规定为 0，如 A 用二进制表示为`01000001`，也就是十进制的 33，独立编码系统。

![ASCII码表](/img/in-post/vary/USASCII_code_chart.png)
上面这张图是 1968 年版 ASCII 编码表。

`ISO/IEC 646`: 是国际标准化组织（ISO）及国际电工委员会（IEC）于 1972 年制定的 7 位元（7bit）字符集的标准，最主要来自美国的 ASCII 码。

`EASCII`: 即 Extended ASCII，延申美国标准信息交换码，将 ASCII 码由 7 位扩充至 8 为，从 128 个字符增长为 256 个字符，扩充出来的符号包括表格符号、计算符号、希腊字母和特殊的拉丁符号，独立编码系统。

`ISO/IEC 8859`: 是国际标准化组织（ISO）及国际电工委员会（IEC）于 1982 年开始联合制定的一系列 8 位元（8bit）字符集的标准，包括 15 个字符集，合并了`EASCII`码。

- ISO/IEC 8859-1 (Latin-1) - 西欧语言
- ISO/IEC 8859-2 (Latin-2) - 中欧语言
- ISO/IEC 8859-3 (Latin-3) - 南欧语言
- ISO/IEC 8859-4 (Latin-4) - 北欧语言
- ISO/IEC 8859-5 (Cyrillic) - 斯拉夫语言
- ISO/IEC 8859-6 (Arabic) - 阿拉伯语
- ISO/IEC 8859-7 (Greek) - 希腊语
- ISO/IEC 8859-8 (Hebrew) - 希伯来语（视觉顺序）
- ISO 8859-8-I - 希伯来语（逻辑顺序）
- ISO/IEC 8859-9（Latin-5 或 Turkish）- 它把 Latin-1 的冰岛语字母换走，加入土耳其语字母。
- ISO/IEC 8859-10（Latin-6 或 Nordic）- 北日耳曼语支，用来代替 Latin-4。
- ISO/IEC 8859-11 (Thai) - 泰语，从泰国的 TIS620 标准字集演化而来。
- ISO/IEC 8859-13（Latin-7 或 Baltic Rim）- 波罗的语族
- ISO/IEC 8859-14（Latin-8 或 Celtic）- 凯尔特语族
- ISO/IEC 8859-15 (Latin-9) - 西欧语言，加入 Latin-1 欠缺的芬兰语字母和大写法语重音字母，以及欧元（€）符号。
- ISO/IEC 8859-16 (Latin-10) - 东南欧语言。主要供罗马尼亚语使用，并加入欧元符号。
  由于英语没有任何重音字母（不计外来词），故可使用以上十五个字集中的任何一个来表示。

至于德语方面，因它除了 A-Z, a-z 外，只用 Ä, Ö, Ü, ä, ö, ß, ü 七个字母，而所有拉丁字集（1-4, 9-10, 13-16）均有此七个字母，故德语可使用以上十个字集中的任何一个来表示。

此系列中没有-12 号的原因是，此计划原本要设计成一个包含塞尔特语族字符集的“Latin-7”，但后来塞尔特语族变成了 ISO 8859-14 / Latin-8。亦有一说谓-12 号本来是预留给印度天城体梵文的，但后来却搁置了。

`Unicode`: 中文称万国码、国际码、统一码、单一码，由**统一码联盟**立项，负责维护发展，是一种**字符**编码方案（不包括字体大小、外观形状、字体形态、文体等）。

`UCS`: 通用字符集，是 ISO 制定的`ISO/IEC 10646`标准所定义的标准字符集。

`Unicode vs ISO 10646`: 历史上存在两个独立的尝试创立单一字符集的组织，即国际标准化组织（ISO）于 1984 年创建的 ISO/IEC 和由 Xerox、Apple 等软件制造商于 1988 年组成的统一码联盟。前者开发的 ISO/IEC 10646 项目，后者开发的统一码项目。因此最初制定了不同的标准。1991 年前后，两个项目的参与者都认识到，世界不需要两个不兼容的字符集。于是，它们开始合并双方的工作成果，并为创立一个单一编码表而协同工作。1991 年，不包含 CJK 统一汉字集的 Unicode 1.0 发布。随后，CJK 统一汉字集的制定于 1993 年完成，发布了 ISO 10646-1:1993，即 Unicode 1.1。

从 Unicode 2.0 开始，Unicode 采用了与 ISO 10646-1 相同的字库和字码；ISO 也承诺，ISO 10646 将不会替超出 U+10FFFF 的 UCS-4 编码赋值，以使得两者保持一致。两个项目仍都独立存在，并独立地公布各自的标准。但统一码联盟和 ISO/IEC JTC1/SC2 都同意保持两者标准的码表兼容，并紧密地共同调整任何未来的扩展。在发布的时候，Unicode 一般都会采用有关字码最常见的字体，但 ISO 10646 一般都尽可能采用 Century 字体。

`UTF-8`: 变长编码方式，使用 1-4 个字节表示一个符号，根据不同的符号而变化字节长度。

`UTF-16`: 变长编码方式，它可以使用 2 个字节或 4 个字节来表示一个符号。其实 UTF-16 与 Unicode 的表示方式 UCS-2 是对应的，在没有辅助平面字符（surrogate code points）前，UTF-16 与 UCS-2 所指的是同一的意思。但当引入辅助平面字符后，就称为 UTF-16 了，它编码的范围也是大于 UCS-2 的。

`UTF-32`: 定长编码方式，对应于 USC-4，也就是 4 个字节。与其他 UTF 相比，UTF-32 的编码长度是固定的，UTF-32 中的每个 32 位值代表一个 Unicode 码位，并且与该码位的数值完全一致。UTF-32 的主要优点是可以直接由 Unicode 码位来索引，相比之下，其他可变长度编码需要进行"循序访问"操作才能在编码序列中找到第 N 个编码；而 UTF-32 的主要缺点是每个码位使用四个字节，空间浪费较多。

`UCS-2 UCS-4`: ISO 提出来的，针对 UCS 的编码方式。

> 可以这么理解，Unicode 和 UCS 是相互兼容的字符集。UTF-8、UTF-16、UTF-32 是针对 Unicode 字符集的实现方式，是编码规则，UCS-2 和 UCS-4 是针对 UCS 字符集的实现方式，是编码规则，现在一般用 UTF-8，因为可以传输所有 Unicode 字符集，且保证高效性，因为不同字符的存储空间不同。Unicode 的实现方式不同于编码方式。一个字符的 Unicode 编码是确定的。但是在实际传输过程中，由于不同系统平台的设计不一定一致，以及出于节省空间的目的，对 Unicode 编码的实现方式有所不同。Unicode 的实现方式称为 Unicode 转换格式（Unicode Transformation Format，简称为 UTF）。

`字符集`: 为每一个字符分配一个唯一的 ID（学名为码位/码点/Code Point）

`编码规则`: 将码位转换为字节序列的规则。

`UTF-16与UCS-2的关系`

UTF-16 可看成是 UCS-2 的父集。在没有辅助平面字符（surrogate code points）前，UTF-16 与 UCS-2 所指的是同一的意思。但当引入辅助平面字符后，就称为 UTF-16 了。现在若有软件声称自己支持 UCS-2 编码，那其实是暗指它不能支持在 UTF-16 中超过 2 字节的字集。对于小于 0x10000 的 UCS 码，UTF-16 编码就等于 UCS 码。

`UTF-32与UCS-4的关系`

在 Unicode 与 ISO 10646 合并之前，ISO 10646 标准为“通用字符集”（UCS）定义了一种 31 位的编码形式（即 UCS-4），其编码固定占用 4 个字节，编码空间为 0x00000000~0x7FFFFFFF（可以编码 20 多亿个字符）。

UCS-4 有 20 多亿个编码空间，但是，为了兼容 Unicode 标准，ISO 承诺将不会为超出 0x10FFFF 的 UCS-4 编码赋值。由此 UTF-32（实际用到$2^{21}$个码位）编码被提出来了，它的编码值与 UCS-4 相同，只不过其编码空间被限定在了 0~0x10FFFF 之间。因此也可以说：UTF-32 是 UCS-4 的一个子集。

> \<https://www.jianshu.com/p/ee1d09fcc4eb\>  
> \<https://www.cnblogs.com/malecrab/p/5300503.html\>
