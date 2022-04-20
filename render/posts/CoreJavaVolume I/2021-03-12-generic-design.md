---
title: "泛型程序设计"
summary: "介绍Java泛型设计思想"
date: "2021-03-12"
author: "Civitasv"
categories:
  - CoreJAVAVolume I
tags:
  - Java核心技术卷I
---

## 定义泛型方法

```java
class ArrayAlg{
    public static <T> T getMiddle(T... a){
        return a[a.length/2];
    }
}
```

```java
private static <T extends Comparable<T>> T getMiddle(T... a) {

}
```

注意，尽管`Comparable`是一个接口，但`<T extends BoundingType>`表示 T 是绑定类型的子类型(subtype)，选择`extends`的原因是子类型更接近子类的概念，Java 的设计者也不打算在语言中再添加一个新的关键字。

一个类型变量可以有多个限定，如`T extends Comparable & Serializable`，限定类型使用`&`进行分隔。

需要注意，类型变量`T`可以多个接口限定，但只能有一个类限定，且类限定必须作为限定列表的首项。

## 类型擦除

编译器在编译 Java 的时候，会进行类型擦除，将类型变量替换为第一个限定类型（没有限定的变量替换为`Object`）

类型擦除可能会与多态发生冲突：

```java
class Pair<T> {
    private T data;
    public void setData(T data) {
        this.data = data;
    }
    public T getData() {
        return data;
    }
}
class DateInterval extends Pair<LocalDate> {
    @Override
    public void setData(LocalDate data) {
        super.setData(data);
    }
}
```

如上代码，类型擦除后，类`Pair`中的`setData`方法将变为`setData(Object data)`，但`DateInterval`类中的`setData`方法为`setData(LocalDate data)`，这显然违反了重写的规则。

此时，编译器会在`DateInterval`类中生成一个**桥方法**：

```java
public void setData(Object data){
    setData((Date)data);
}
```

该方法用来调用`setData(LocalDate data)`，实现多态。

总之，Java 虚拟机中不存在泛型，只有普通的类和方法；所有的类型参数都用他们的限定类型替换；桥方法被用来保持多态；为保持类型安全性，必要时插入强制类型转换。

## 约束与局限性

1. 不能用基本类型实例化类型参数
2. 运行时类型查询只适用于原始类型，`a instanceof Pair<String>`只会检查`a`是否是任意类型的一个`Pair`
3. 不能创建参数化类型的数组，数组会记住它所存放的数据类型，如果试图存放其它类型的元素，会抛出`ArrayStoreException异常`，如：

   ```java
   String[] strArray = new String[20];
   Object[] objArray = strArray;
   objArray[0] = new Integer(1); // throws ArrayStoreException at runtime
   ```

   但由于类型擦除，编译器无法获得参数化类型数组的具体类型，如数组`Pair<String>[] pairs = new Pair<String>[10];`，类型擦除后`pairs`的类型会变成`Pair[]`，如果我们像上面那样：

   ```java
   Pair<String>[] pairs = new Pair<String>[10];
   Object[] objArray = pairs;
   pairs[0] = new Pair<Employee>(); // no problem
   ```

   这时由于类型已被擦除，不但编译不会出错，存储时也无法检测出错误，但是当我们取值时却发现不是想要的`Pair<String>`却是`Pair<Employee>`，这就破坏了数组存储的机制，后果就会十分糟糕了，也正是因此，`Java`不允许创建参数化类型的数组。

   注意，只是不允许创建这些数组，但声明类型为`Pair<String>[]`的变量是合法的，只是不能用`new Pair<String>[10]`来初始化这个变量。

   要想使用参数化类型数组，一种做法是使用`ArrayList`，或者：

   ```java
   Pair<Integer>[] pairs = (Pair<Integer>[]) new Pair<?>[10];
   pairs[0] = new Pair<Double>(); // error!

   Pair<String>[] pairs = (Pair<String>[]) new Pair<?>[10];
   Object[] objects = pairs;
   objects[0] = new Pair<Double>();
   ((Pair<Double>) objects[0]).setData(10.0);
   System.out.println(pairs[0].getData()); // ClassCastException
   ```

   安全且有效的方法是使用`ArrayList`，因为`ArrayList`是使用`Object`数组存储所有对象，在获取数据时进行强转检查。

   可以理解为子类是一种特殊的父类，而父类不是特殊的子类。所以可以使用子类生成父类，而不能通过父类生成子类，当然，这也是多态的重要组成部分。

4. 不能实例化类型变量
5. 不能构造泛型数组
6. 泛型类的静态上下文中类型变量无效
