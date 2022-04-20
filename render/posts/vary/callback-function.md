---
title: "回调函数"
summary: "回调（callback）是一种十分常见的程序设计模式，callback 意为 call then back，即调用然后返回主函数，其目的是允许底层代码调用高层定义的代码"
date: "2020-12-21"
author: "Civitasv"
categories:
  - 编程思想
tags:
  - callback
---

回调（callback）是一种十分常见的程序设计模式，callback 意为 call then back，即调用然后返回**主函数**，其目的是**允许底层代码调用高层定义的代码**。

什么叫底层代码调用高层定义的代码？下面以点击事件为例进行解释

只要是涉及到用户界面，都会有点击事件，但一般开发者设计库的时候无法明确用户**点击**之后想要**做什么**，这时就需要用到回调的思想。

以 Java 为例，关于点击事件，常常会定义一个`OnClickListener`的接口，在其中定义`onClick`事件：

```java
public interface OnClickListener{
    void onClick();
}
```

然后开发者在需要定义点击事件的类 A 中定义`setOnClickListener`方法：

```java
public class A{
    private OnClickListener onClickListener;

    public void setOnClickListener(OnClickListener onClickListener){
        this.onClickListener = onClickListener;
    }
}

```

在类 A 的点击事件函数中：

```java
public void onClick(){
    if(onClickListener!=null)
        onClickListener.onClick();
}
```

以上就是底层代码库关于点击事件的简化版。

用户在使用该代码库时，如果想要定制自己的点击事件，则只需要调用该对象的`setOnClickListener`方法：

```java
A a = new A();

a.setOnClickListener(new OnClickListener(){
    public void onClick(){
        System.out.println("这是我自己定义的点击事件");
    }
});
```

以上就是高层定义的代码。

那么如果用户点击时，程序库将监听到点击事件，调用 A 类的`onClick`方法，在`onClick`方法中就会调用`onClickListener.onClick();`了，这就完成了底层代码调用在高层定义的程序的过程。

这个过程也就是回调。
