---
title: "核密度估计（KDE）原理及实现"
summary: "参数估计指样本数据来自一个具有明确概率密度函数的总体，而在非参数估计中，样本数据的概率分布未知，这时，为了对样本数据进行建模，需要估计样本数据的概率密度函数，核密度估计即是其中一种方式"
date: "2021-05-19"
author: "Civitasv"
categories:
  - gis
tags:
  - gis
  - kde
  - 空间分析
---

> 参数估计指样本数据来自一个具有明确概率密度函数的总体，而在非参数估计中，样本数据的概率分布未知，这时，为了对样本数据进行建模，需要估计样本数据的概率密度函数，核密度估计即是其中一种方式。

## 引言

统计学中，核密度估计，即**Kernel Density Estimation**，用以基于有限的样本推断总体数据的分布，因此，核密度估计的结果即为样本的概率密度函数估计，根据该估计的概率密度函数，我们就可以得到数据分布的一些性质，如数据的聚集区域。

## 从直方图开始

直方图由 Karl Pearson 提出，用以表示样本数据的分布，帮助分析样本数据的众数、中位数等性质，横轴表示变量的取值区间，纵轴表示在该区间内数据出现的频次与区间的长度的比例。

美国人口普查局（The U.S. Census Bureau）调查了 12.4 亿人的上班通勤时间，数据如下：

| 起点 | 组距 | 频次  | 频次/组距 | 频次/组距/总数 |
| :--: | :--: | :---: | :-------: | :------------: |
|  0   |  5   | 4180  |    836    |     0.0067     |
|  5   |  5   | 13687 |   2737    |     0.0221     |
|  10  |  5   | 18618 |   3723    |      0.03      |
|  15  |  5   | 19634 |   3926    |     0.0316     |
|  20  |  5   | 17981 |   3596    |     0.029      |
|  25  |  5   | 7190  |   1438    |     0.0116     |
|  30  |  5   | 16369 |   3273    |     0.0264     |
|  35  |  5   | 3212  |    642    |     0.0052     |
|  40  |  5   | 4122  |    824    |     0.0066     |
|  45  |  15  | 9200  |    613    |     0.0049     |
|  60  |  30  | 6461  |    215    |     0.0017     |
|  90  |  60  | 3435  |    57     |     0.0005     |

使用直方图进行[数据可视化如下](https://en.wikipedia.org/wiki/Histogram#/media/File:Travel_time_histogram_total_n_Stata.png)：

![Histogram of travel time (to work), US 2000 census. Area under the curve equals the total number of cases. This diagram uses Q/width from the table.](/img/in-post/kde/Travel_time_histogram_total_n_Stata.png)

该直方图使用单位间隔的人数（频次/组距）表示为每个矩形的高度，因此每个矩形的面积表示该区间内的人数，矩形的总面积即为 12.4 亿。

而当直方图使用（频次/组距/总数）表示为每个矩形的高度时，[数据可视化如下](https://en.wikipedia.org/wiki/Histogram#/media/File:Travel_time_histogram_total_1_Stata.png)：

![Histogram of travel time (to work), US 2000 census. Area under the curve equals 1. This diagram uses Q/total/width from the table.](/img/in-post/kde/Travel_time_histogram_total_1_Stata.png)

此时，矩形的面积表示该区间所占的频率，矩形的总面积为 1，该直方图也即**频率直方图**。

频率直方图有以下特点：

1. 矩形面积为该区间的频率；
2. 矩形的高度为该区间的平均频率密度。

## 概率密度函数

**极限思维**：我们使用微分思想，将频率直方图的组距一步步减小，随着组距的减小，矩形宽度越来越小，因此，在极限情况下频率直方图就会变成一条曲线，而这条曲线即为概率密度曲线。

对于概率密度曲线，我们知道：随机变量的取值落在某区域内的概率值为概率密度函数在这个区域的积分（见[百度百科](https://baike.baidu.com/item/%E6%A6%82%E7%8E%87%E5%AF%86%E5%BA%A6%E5%87%BD%E6%95%B0)），即：$P(a< x \leq b) = \int\limits_a^b f(x)dx$。

设累积分布函数为$F(x)$，根据上述定义，则$F(x) = \int\limits_{-\infty}^x f(x)dx$。

根据微分思想，则有：

\begin{align}
f(x_0)
&= \dot{F(x_0)}\\
&= \lim^{}_{h \to 0}\frac{F(x_0+h)-F(x_0 - h)}{2h}
\end{align}

## 核密度估计

根据上述分析，我们应该已经明白核密度估计的目的事实上就是估测所给样本数据的概率密度函数。

### 公式推导

考虑一维数据，有如下 $n$ 个样本数据：$x_1,x_2,x_3,...,x_n$。

假设该样本数据的累积分布函数为$F(x)$，概率密度函数为$f(x)$，则有：

$$F(x_{i-1} < x < x_i) = \int\limits_{x_{i-1}}^{x_i} f(x)dx$$

$$f(x_i) = \lim^{}_{h \to 0}\frac{F(x_i+h)-F(x_i-h)}{2h}$$

引入累积分布函数的[经验分布函数](https://zh.wikipedia.org/wiki/%E7%BB%8F%E9%AA%8C%E5%88%86%E5%B8%83%E5%87%BD%E6%95%B0)：

$$F_n(t) = \frac{1}{n}\sum_{i=1}^n1_{x_i \leq t}$$

该函数大概意思为：使用 $n$ 次观测中$x_i \leq t$出现的次数与 $n$ 的比值来近似描述$P(x \leq t)$。

将该函数代入$f(x_i)$，有：

$$f(x_i) = \lim_{h \to 0}\frac{1}{2nh}\sum_{i=1}^n 1_{x_i-h \leq x_j \leq x_i+h}$$

根据该公式，在实际计算中，必须给定$h$值，$h$值不能太大也不能太小，太大不满足$h \to 0$的条件，太小使用的样本数据点太少，误差会很大，因此，关于$h$值的选择有很多研究，该值也被称为核密度估计中的**带宽**。

确定带宽后，我们可以写出$f(x)$的表达式：

$$f(x) = \frac{1}{2nh}\sum_{i=1}^n1_{x-h \leq x_i \leq x+h}$$

### 核函数

$f(x)$表达式可变形为：

$$
\begin{align}
f(x) &= \frac{1}{2nh}\sum_{i=1}^n 1_{x-h \leq x_i \leq {x+h}}\\
    &= \frac{1}{2nh}\sum_{i=1}^n K(\frac{|x-x_i|}{h})
\end{align}
$$

其中，令 $t = \frac{\|x-x_i\|}{h}$，则当$0 \leq t \leq 1$时，$K(t) = 1$.

且：

$$
\begin{align}
\int f(x)dx
&=\int\frac{1}{2nh}\sum_{i=1}^nK(\frac{|x-x_i|}{h})dx\\
&= \int\frac{1}{2n}\sum_{i=1}^nK(t)dt\\
&= \int\frac{1}{2} K(t)dt
\end{align}
$$

注意，此处的$\sum^{n}_{i=1}$指的是 $n$ 次实验，而不是累计，因此计算值为 $n$。

令$K_0(t) = \frac{1}{2} K(t)$，根据概率密度函数的定义，我们有：

$$\int K_0(t)dt = 1$$

其中当$0 \leq t \leq 1$时，$K_0(t) = \frac{1}{2}$.

此时$K_0(t)$就称为**核函数**，常用的核函数有:$uniform,triangular, biweight, triweight, Epanechnikov, normal...$。

$f(x)$的表达式变为：

$$f(x) = \frac{1}{nh}\sum^{n}_{i=1}K_0(\frac{|x-x_i|}{h})$$

对于二维数据，$f(x)$为：

$$f(x, y) = \frac{1}{nh^2}\sum^{n}_{i=1}K_0(\frac{dist((x, y), (x_i, y_i))}{h})$$

## 实验：POI 点核密度分析

### 技术选型

- 栅格数据可视化：**canvas**
- KFC POI 爬取：[POIKit](https://github.com/Civitasv/AMapPoi)

### 核函数、带宽选择

使用 ArcGIS 软件说明文档提供的带宽选择方案，核函数为：

$$K_0(t) = \frac{3}{\pi}(1-t^2)^2$$

概率密度估测函数为：
$$f(x, y) = \frac{1}{n*h^2}\sum_{i=1}^n pop_i K_0(\frac{dist_i}{h})$$

其中，$pop_i$为给定的权重字段，若不含有该字段，则取值为 1，$n$为 POI 点个数。

带宽为：

$$h = 0.9*min(A,\sqrt{\frac{1}{\ln(2)}}*D_m)*n^{-0.2}$$

参数解释：

- 平均中心：指$n$个 POI 点的平均中心，即经度和纬度分别取平均；
- 加权平均中心：指$n$个 POI 点的加权平均中心，即经度和纬度分别乘以权重再取平均；
- 标准距离计算公式：

  $$
  SD = \sqrt{\frac{\sum_{i=1}^n(x_i-\bar X)^2}{n}+\frac{\sum_{i=1}^n(y_i-\bar Y)^2}{n}+\frac{\sum_{i=1}^n(z_i-\bar Z)^2}{n}}
  $$

  其中：

  - $x_i,y_i,z_i$ 是 POI 的坐标
  - ${\bar X,\bar Y, \bar Z}$ 表示平均中心
  - $n$ 是 POI 总数

- 加权标准距离计算公式：

  $$
  SD_w = \sqrt{\frac{\sum_{i=1}^n w_i(x_i-\bar X_w)^2}{\sum_{i=1}^{n}w_i}+\frac{\sum_{i=1}^nw_i(y_i-\bar Y_w)^2}{\sum_{i=1}^{n}w_i}+\frac{\sum_{i=1}^nw_i(z_i-\bar Z_w)^2}{\sum_{i=1}^{n}w_i}}
  $$

  其中：

  - $w_i$ 是要素$i$ 的权重
  - ${\bar X_w,\bar Y_w, \bar Z_w}$ 表示加权平均中心
  - $n$ 是 POI 总数

- 若 POI 点**不含有**权重字段，则$D_m$为到平均中心距离的中值，$n$是 POI 点数目，$A$是标准距离$SD$；
- 若 POI 点**含有**权重字段，则$D_m$为到加权平均中心距离的中值，$n$是 POI 点权重字段值的总和，$A$是加权标准距离$SD_w$。

### 数据爬取

使用 **POIKit**，爬取河南省 KFC POI 数据，参数设置如下：
![POIKit参数设置](/img/in-post/kde/parameter-set.png)
共爬取得到 219 条数据，如下图所示：
![数据展示](/img/in-post/kde/data.png)

### 程序编写

**核函数：**

```js
/**
 * 核函数
 * @param {Number} t 变量
 * @returns
 */
function kernel(t) {
  return (3 / Math.PI) * Math.pow(1 - t * t, 2);
}
```

**带宽：**

```js
/**
 * 带宽
 * @param {Point[]} pts 所有POI点
 * @param {Point} avePt 平均中心
 * @returns
 */
function h(pts, avePt) {
  const SD_ = SD(pts, avePt);
  const Dm_ = Dm(pts, avePt);
  if (SD_ > Math.sqrt(1 / Math.log(2)) * Dm_) {
    return 0.9 * Math.sqrt(1 / Math.log(2)) * Dm_ * Math.pow(pts.length, -0.2);
  } else {
    return 0.9 * SD_ * Math.pow(pts.length, -0.2);
  }
}
```

**平均中心：**

```js
/**
 * 平均中心
 * @param {Point} pts 所有POI点
 * @returns
 */
function ave(pts) {
  let lon = 0,
    lat = 0;
  pts.forEach((pt) => {
    lon += pt.lon;
    lat += pt.lat;
  });
  return new Point(lon / pts.length, lat / pts.length);
}
```

**标准距离 SD：**

```js
/**
 * 标准距离
 * @param {Point[]} pts 所有POI点
 * @param {Point} avePt 平均中心
 * @returns
 */
function SD(pts, avePt) {
  let SDx = 0,
    SDy = 0;
  pts.forEach((pt) => {
    SDx += Math.pow(pt.lon - avePt.lon, 2);
    SDy += Math.pow(pt.lat - avePt.lat, 2);
  });
  return Math.sqrt(SDx / pts.length + SDy / pts.length);
}
```

**Dm（到平均中心距离的中值）：**

```js
/**
 * Dm
 * @param {Point[]}} pts 所有POI点
 * @param {Point} avePt 平均中心
 * @returns
 */
function Dm(pts, avePt) {
  let distance = [];
  pts.forEach((pt) => {
    distance.push(Gauss(pt, avePt));
  });
  distance.sort();
  return distance[distance.length / 2];
}
```

**核密度估计：**

```js
/**
 * 核密度估计
 * @param {Point[]} pts 所有POI点
 * @param {Rect} rect POI点边界
 * @param {Number} width 栅格图像宽度
 * @param {Number} height 栅格图像高度
 */
function kde(pts, rect, width, height) {
  const estimate = new Array(height)
    .fill(0)
    .map(() => new Array(width).fill(0));
  let min = Infinity,
    max = -Infinity;
  const avePt = ave(pts);
  const bandWidth = h(pts, avePt);
  rect.top += bandWidth;
  rect.bottom -= bandWidth;
  rect.left -= bandWidth;
  rect.right += bandWidth;
  const itemW = (rect.right - rect.left) / width;
  const itemH = (rect.top - rect.bottom) / height;
  for (let x = 0; x < width; x++) {
    const itemX = rect.left + itemW * x;
    for (let y = 0; y < height; y++) {
      const itemY = rect.bottom + itemH * y;
      let fEstimate = 0;
      for (let m = 0; m < pts.length; m++) {
        const distance = Gauss(pts[m], new Point(itemX, itemY));
        if (distance < Math.pow(bandWidth, 2)) {
          fEstimate += kernel(distance / bandWidth);
        }
      }
      fEstimate = fEstimate / (pts.length * Math.pow(bandWidth, 2));
      min = Math.min(min, fEstimate);
      max = Math.max(max, fEstimate);
      estimate[height - y - 1][x] = fEstimate;
    }
  }
  return { estimate, min, max };
}
```

然后使用 html5 canvas 进行可视化：

```js
/**
 * 绘制核密度估计结果栅格图
 * @param {CanvasRenderingContext2D} ctx canvas上下文
 * @param {*} param0 核密度估测值，最大值，最小值
 */
function draw(ctx, { estimate, min, max }) {
  const height = estimate.length,
    width = estimate[0].length;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const val = (estimate[y][x] - min) / (max - min);
      if (val > 0 && val < 0.4) {
        ctx.fillStyle = "rgb(228, 249, 245)";
        ctx.fillRect(x, y, 1, 1);
      } else if (val >= 0.4 && val < 0.7) {
        ctx.fillStyle = "rgb(48, 227, 202)";
        ctx.fillRect(x, y, 1, 1);
      } else if (val >= 0.7 && val < 0.9) {
        ctx.fillStyle = "rgb(17, 153, 158)";
        ctx.fillRect(x, y, 1, 1);
      } else if (val >= 0.9 && val <= 1) {
        ctx.fillStyle = "rgb(64, 81, 78)";
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}
```

### 核密度估计结果

下图是核密度估计结果：

![核密度估计结果](/img/in-post/kde/kde-result.png)

通过该图，可发现核密度估计的结果能很好的展示数据的**热点**区域。

## 全部代码

关注微信公众号**古月有三木**，回复**核密度分析**即可获取全部代码及数据。
