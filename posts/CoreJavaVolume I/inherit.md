---
title: "继承"
summary: "继承的基本思想是基于已有的类创建新的类。继承已经存在的类就可以复用这些类的方法，还可以增加一些新的方法和字段，使新类能够适应新的情况，这是 Java 程序设计中的一项核心技术"
date: 20"20-12-21"
author: "Civitasv"
categories:
  - CoreJAVAVolume I
tags:
  - Java核心技术卷I
---

> 继承的基本思想是基于已有的类创建新的类。继承已经存在的类就可以复用这些类的方法，还可以增加一些新的方法和字段，使新类能够适应新的情况，这是 Java 程序设计中的一项核心技术。

## 类、超类和子类

继承需要遵循`is-a`的原则，就像科学家是人，律师也是人，那么“科学家”和“律师”就可以继承“人”。

使用关键字`extends`可以继承一个已存在的类，如：

```java
public class A extends B{
    // add methods and fields
}
```

这里的`B`称为**超类**（super class）、基类（base class）或父类（parent class），`A`称为子类（sub class）、派生类（derived class）或**子类**（child class）。

通过扩展超类定义子类的时候，只需要指出子类与超类的不同之处，因此在设计类的时候应该将最一般的方法放在超类中，而将更特殊的方法放在子类中，这种将通用功能抽取到超类的做法在面向对象程序设计中十分普遍。

`super.method()`可以调用父类的方法。

`super()`可以调用父类的构造器。

父类对象变量可以动态的引用父类和子类对象，这种机制称为**多态**，在运行时可以自动的选择合适的方法，这种机制称为**动态绑定**。

例如：

```java
public class Test {
    public static void main(String[] args){
        A a = new A();
        System.out.println(a.getVal()); // 输出400
        A b = new B();
        System.out.println(b.getVal()); // 输出500
    }
}

class A{
    public int getVal(){
        return 400;
    }
}

class B extends A{
    @Override
    public int getVal(){
        return 500;
    }
}
```

注意：如果不想让某个方法被继承，只需添加`final`关键字修饰符即可。

子类在覆盖父类方法的时候可以修改覆盖方法的返回类型。

**继承层次（inheritance hierarchy）**：指由一个公共超类派生出来的所有类的集合。

## 多态

在 Java 程序设计语言中，对象变量是多态的（polymorphic），一个父类的对象变量可以引用一个父类的对象也可以引用父类的任何子类的对象。

```java
// B extends A
B[] as = new B[2];
A[] aa = as;
aa[0] = new A();
System.out.println(as[0].getB()); // ArrayStoreException
```

多态采取动态绑定，在运行时可以选择所引用对象的具体实现方法进行执行。

## 方法调用流程

准确的理解对象调用方法的流程十分重要，假设要调用`x.f(args)`，其中`x`为类`C`的对象。调用流程如下：

1. 编译器查看对象的声明类型和方法名。编译器将一一列举 C 类中所有名为 f 的方法和其父类中所有名为 f 而且可以访问的方法，这时编译器就知道了所有可能被调用的候选方法；

2. 接下来，编译器根据调用方法的参数类型，选择候选方法中与所提供参数类型完全匹配的方法，这个过程称为重载解析（overloading resolution），如果编译器没有找到与参数类型匹配的方法，将报错，至此编译器已经知道需要调用方法的名字和参数类型；

3. 如果是`private`、`static`或`final`类型的方法（一定为 C 类中的方法，也就是步骤 2 找到的方法），那么编译器将可以准确的知道应该调用哪个方法，这称为静态绑定（static binding）。否则，编译器就会采取动态绑定策略，生成一个调用`f(String)`的指令；

4. 程序运行并且采用动态绑定方法时，虚拟机必须调用与 x 所引用对象的**实际类型**对应的那个方法。例如，如果 x 的实际类型是 D，它继承了 C，如果 D 类中定义了`f(String)`方法，那么将调用该方法，否则就会在 D 类的父类中寻找该方法，以此类推。

注意：每次调用方法运行至步骤 4 都需要搜索方法，这样时间开销很大，因此，虚拟机会事先为每个类计算一个方法表（method table），记录所有方法的签名和要调用的**实际方法**，这里面的方法表就包含了某类的**全部**方法（包括`Object`超类中的方法），同时也标注了该方法到底是哪个类的方法（本类方法/超类方法）。

以上流程对于所有类的超类`Object`中的方法调用也适用。

## 阻止继承：final 类和方法

sometimes，我们希望阻止某个类被继承。这种不允许被扩展的类就成为`final`类。如果在定义类的时候使用了`final`修饰符就表明这个类是`final`类。声明方式如下：

```java
public final class A{

}
```

类中的某个方法也可以被声明为 final 类型，这表明子类无法重写该方法。

## 强制类型转换

1. 只能在继承层次内进行强制类型转换；

2. 在将超类强制转换成子类之前，应该使用`instanceof`函数进行检查。

## 访问控制修饰符

1. 仅对本类可见——private

2. 对外部完全可见——public

3. 对本包和所有子类可见——protected

4. 对本包可见——默认

## Object——所有类的超类

在 Java 中，默认情况`Object`是每个类的父类。

### equals 方法

`Object`类中的`equals`方法用于检测一个对象是否等于另一个对象。默认情况下：如果两个对象引用相等，两个对象才相等。对于很多情况，这已经足够了，如：

1. 类的每个实例本质上都是唯一的。

2. 不关心类是否提供了“逻辑相等（logical equality）”的功能。

3. 超类已经覆盖了 equals，从超类继承过来的行为对于子类也是合适的。

但如果类具有自己特有的逻辑相等的概念，如判断`String`对象是否相等往往是判断字符串是否相同。当调用 equals 方法时，希望知道他们在逻辑上是否相等，而不是判断它们是否指向同一个对象，这时就必须覆盖`equals`和`hashCode`方法。

编写`equals`方法时，必须遵守通用约定，JavaSE6 规范了`equals`实现等价关系，即遵守以下五个性质：

1. 自反性（reflexive）。对于任何非 null 的引用值 x，x.equals(x) = true

2. 对称性（symmetric）。对于任何非 null 的引用值 x 和 y，当且仅当 y.equals(x) = true 时，x.equals(y) = true。

3. 传递性（transitive）。对于任何非 null 的引用值 x、y 和 z，如果 x.equals(y) = true，并且 y.equals(z) = true，那么 x.equals(z) = true。

4. 一致性（consistent）。对于任何非 null 的引用值 x 和 y，只要 equals 的比较操作在对象中所用的信息没有被修改，多次调用 x.equals(y)就会一致的返回 true，或者一致的返回 false。

5. 对于任何非 null 的引用值 x，x.equals(null) = false

实现模板：

```java
public class A{
    private int val;
    private String name;

    @Override
    public boolean equals(Object otherObject){
        if(this == otherObject) return true;

        if(otherObject == null) return false;

        if(getClass() != otherObject.getClass()) return false;

        A other = (A) otherObject;

        return val == other.val
            && Objects.equals(name,other.name);
    }
}
```

若使用 instanceof，只需要将`if(getClass() != otherObject.getClass()) return false;`修改为
`if(!(otherObject instanceof A)) return false;`，同时不需要判断是否为空，因为如果 instanceof 函数的第一个操作数为 null，会返回 false。代码实现如下：

```java
public class A {
    private int val;
    private String name;

    @Override
    public boolean equals(Object otherObject) {
        if (this == otherObject) return true;

        if (!(otherObject instanceof A)) return false;

        A other = (A) otherObject;

        return val == other.val
                && Objects.equals(name, other.name);
    }
}
```

`instanceof`方式允许受比较的对象属于子类对象；而`getClass`方式则要求两个参数必须是严格同一类才能比较，否则就返回 false。下面分别从`instanceof`的角度和`getClass`的角度说明实际应用中二者的局限性和建议实现方式。

#### **instanceof**

instanceof 方式可以用于子类之间的比较，但需要注意在父类与子类的比较很可能会违反`equals`所规定的原则，如我们定义类 A 和 B，其中 B 继承 A。

```java
class A {
    private final String a;

    public A(String a) {
        this.a = a;
    }

    @Override
    public boolean equals(Object otherObject) {
        if (this == otherObject) return true;

        if (!(otherObject instanceof A)) return false;

        A other = (A) otherObject;

        return Objects.equals(a, other.a);
    }
}

class B extends A {
    private final String b;

    public B(String a, String b) {
        super(a);
        this.b = b;
    }

    @Override
    public boolean equals(Object otherObject) {
        if (this == otherObject) return true;

        if (!(otherObject instanceof B)) return false;

        B other = (B) otherObject;

        return super.equals(otherObject) && Objects.equals(b, other.b);
    }
}
```

这时，编写如下测试:

```java
A a = new A("ss");
B b = new B("ss", "bb");
System.out.println(a.equals(b)); // true
System.out.println(b.equals(a));  // false
```

这是因为前一种比较忽略了字符串`b`，而后一种比较则总是返回 false，因为参数的类型不正确。当然，你可以尝试在比较时查询受比较对象的类型，如果对象是父类类型则调用父类的 equals 方法，修改如下：

```java
@Override
public boolean equals(Object otherObject) {
    if (this == otherObject) return true;

    if (!(otherObject instanceof A)) return false;

    if(!(otherObject instanceof B)) return otherObject.equals(this);

    B other = (B) otherObject;

    return super.equals(otherObject) && Objects.equals(b, other.b);
}
```

这样对称性将得到保证，但是传递性却无法保证了：

```java
B b = new B("ss", "bb");
A a = new A("ss");
B b2 = new B("ss","cc");
System.out.println(b.equals(a)); // true
System.out.println(a.equals(b2));  // true
System.out.println(b.equals(b2));  // false
```

此处`b.equals(a) = true, a.equals(b2) = true`，但`b.equals(b2) = false`，显然传递性无法得到保证。

事实上，这时面向对象程序设计语言中关于等价关系的一个基本问题，即：

**我们无法在扩展可实例化的类的同时，既增加新的值组件，又保证 equals 规定。**

这时一些程序员就引入了`getClass`判断。

#### **getClass**

使用`getClass`方法判断就不会出现`instanceof`中子类继承父类，父类与子类之间或子类与子类之间进行判断相等的问题，因为它严格要求判断的对象与被判断的对象同属一个类，否则会返回 false，这样它显然能满足`equals`方法的原则。

但是，《effective Java》中提出，这将违反里氏替换原则（_Liskov substitution principle_），即**一个类型的任何重要属性也将适用于它的子类型，因此为该类型的编写的任何方法，在它的子类型上也应该同样运行的很好**。一个典型的例子就是`AbstractSet`和其子类`TreeSet`和`HashSet`，它们采用不同的算法查找集合元素，但我们肯定希望能够比较这两个集合，但如果采取`getClass`方法，`TreeSet`和`HashSet`之间的元素自然不可能相等。

《Java 核心技术 卷 1》中指出，对于这个问题，解决方法是：应该在`AbstractSet`中使用`instanceof`定义`equals`方法，并将其定义为`final`类型，确保子类无法实现该方法，但事实上，Java 源码中并未将该方法定义为`final`方法，此时，按照`equals`方法实现的原则，应该使用`getClass`方法，（认为是 Java 实现的一个问题）。

#### **总结**

因此，总结一下，目前有三种情形：

1. 如果超类是**抽象**类型，那么在子类中新的值组件，采取 instanceof 方式检测是不会违反`equals`的约定的，因为我们无法创建一个抽象类型的实例；

2. 如果非抽象类的子类可以定义自己的`equals`方法，那么对称性需求要求强制使用`getClass`方式检测，这样不可以在不同子类或子类与超类之间进行相等性比较；

3. 如果子类由超类决定自己的相等性概念，那么可以在超类中使用`instanceof`方式检测，并使用`final`修饰，符合里氏替换原则，这样可以在不同子类或子类与超类之间进行相等性比较。

注意，对于第 2 种情形，《effective Java》的作者认为一种不错的权宜之计是采取聚合（复合）而非继承。这种方式本质上是取消了继承，也就不存在子类/超类了，自然也就不会出现问题，不过我认为这是一种**逃避**的做法，如果一定要使用继承，还是需要使用`getClass`方式进行验证。

编写一个完美的`equals`方法的建议（《Java 核心技术 卷 1》）：

1. 显式参数命名为 otherObject，稍后需要将它强制转换成另一个名为 other 的变量；

2. 检测 this 与 otherObject 是否相等；

3. 检测 otherObject 是否为 null，如果为 null，返回 false；

4. 比较 this 与 otherObject 所在的类，如果 equals 的语义可以在非抽象类型的子类中变化，就必须使用 getClass 检测（_或取消继承改用复合，也能使用 instanceof 检测_），如果 equals 的语义在抽象类型的子类中变化，可以使用 instanceof 检测，如果所有的子类（不管是抽象类还是非抽象类的子类）都具有相同的相等性判断，那么可以使用 instanceof 检测，且仅在超类中定义`equals`方法，声明为`final`表示不允许继承；

5. 将 otherObject 强制转换为相应类类型的变量；

6. 现在根据相等性概念的要求来比较字段，使用`==`比较基本类型字段，使用`Objects.equals`比较对象字段，使用`Arrays.equals`比较数组字段，如果在子类中重新定义 equals，就要在其中包含一个 super.equals(other)判断。

`equals`方法看似简单，但实际上其中却充满着陷阱，例如 Java 中的`TimeStamp`和`Date`类，`TimeStamp`继承`Date`类，且包含自己的 equals 实现，但`Date`类中的`equals`方法却采用`instanceof`方式进行检测，显然就导致了错误。

### hashCode 方法

在每个覆盖了`equals`方法的类中，必须覆盖`hashCode`方法，不然基于 hash 的集合无法正常工作，如`HashMap, HashSet, Hashtable`。

Object 规范：

> 在应用程序的执行期间，只要对象的 equals 方法的比较操作所用到的信息没有被修改，那么对这同一个对象调用多次，hashCode 方法都必须始终如一地返回同一个整数。在同一个应用程序的多次执行过程中，每次执行返回的整数可以不一致；  
> 如果两个对象根据`equals(Object)`方法比较是相等的，那么调用这两个对象的 hashCode 方法必须产生相等的整数结果。  
> 如果两个对象根据`equals(Object)`方法比较不相等，那么调用这两个对象的 hashCode 方法不一定要产生不同的整数，但产生不同的整数结果可能会提高基于 hash 的集合的性能。

一个好的 hashCode 函数：

```java
class A{
    private int val;

    private String name;

    public int hashCode(){
        return Objects.hash(val, name);
    }
}
```

hashCode 与 equals 方法结合使用：

```java
class C{
    private int[]arr;

    private int val;

    private String name;

    private Date date;

    private String name2;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        C c = (C) o;
        return val == c.val && Arrays.equals(arr, c.arr) && Objects.equals(name, c.name) && Objects.equals(date, c.date) && Objects.equals(name2, c.name2);
    }

    @Override
    public int hashCode() {
        int result = Objects.hash(val, name, date, name2);
        result = 31 * result + Arrays.hashCode(arr);
        return result;
    }
}
```

使用`Objects.hash`生成对象的 hash 值，使用`Arrays.hash`生成数组的 hash 值。

事实上，Objects.hash(Object... objects)内部也是使用 Array.hash 函数生成 hash 值的。

`Arrays.hash`函数实现：

```java
public static int hashCode(Object a[]) {
    if (a == null)
        return 0;
    int result = 1;
    for (Object element : a)
        result = 31 * result + (element == null ? 0 : element.hashCode());
    return result;
}
```

其中不同的类型有不同的 hashCode()方法实现，但其属于数学知识了，在此不深究。

## 泛型数组列表

声明泛型数组:

```java
ArrayList<A> list = new ArrayList<>();
```

其中`<>`被称为菱形语法。

与数组不同的是，`ArrayList`能够在添加或删除元素时，自动地确定数组容量，但实际上，`ArrayList`内部还是通过数组构造的，其有一套算法可以自动地确定数组容量，需要明确的是，重新分配空间会开销很大，因此，如果确定数组的长度大于 n 的话，最好在构建`ArrayList`的时候或调用`ensureCapacity`方法为其分配大小为 n 的空间，这样，前 n 次调用 add 方法不会开销很大。

同样的，由于`ArrayList`基于数组实现，因此查询操作十分高效，但插入和删除要素就效率很低了，插入或删除将导致这个位置之后的所有元素都发生变化，因此如果存储的元素比较多，应该考虑使用链表（`LinkedList`）。

## 对象包装器与自动装箱

Java 的八种基本类型都具有其**包装器（wrapper）**，如下：

```java
int -> Integer
short -> Short
byte -> Byte
long -> Long
float -> Float
double -> Double
boolean -> Boolean
char -> Character
```

包装器类可以被用于泛型中。

**自动拆箱**: `int n = list.get(i);`

**自动装箱**: `list.add(3);`

## 参数数量可变的方法

Java 中，可以使用`重载`机制使同一函数参数数量可变。

```java
class A{
    public int a(){
        return 0;
    }

    public int a(int val){
        return val;
    }

    public void a(int val,int val2){

    }
}
```

以上均是合法的。

!!! note
Java 中方法签名是由方法名和参数列表决定的，因此`int a(int val)`和`void a(int val)`无法同时定义。

## 枚举类

一个简单的枚举类：

```java
public enum Size{
    SMALL, MEDIUM, LARGE
}
```

实际上，枚举类型是一个类，在`Size`中，刚好初始化三个实例`SMALL MEDIUM LARGE`，枚举类无法创建新的对象，因此可以直接使用`==`比较两个枚举对象的值。

可以为枚举类型增加构造器、方法和字段：

```java
public enum Size{
    SMALL("S"), MEDIUM("M"), LARGE("L");

    private String abbr;

    private Size(String abbr){
        this.abbr = abbr;
    }

    public String getAbbr(){
        return abbr;
    }
}
```

注意枚举类型中的构造器必然为`private`类型。

## 反射

> 反射库提供了一个丰富且精巧的工具集，可以用来编写能够动态操纵 Java 代码的程序。使用反射，Java 可以支持用户界面生成器、对象关系映射器以及很多其他需要动态查询类能力的开发工具。

反射机制可以用来：

1. 在运行时分析类；

2. 在运行时检查对象；

3. 实现泛型数组操作代码；

4. 利用`Method`对象，获取函数"指针"。

反射机制功能强大，但同时也很复杂。

### Class 类

`Class`对象用于描述一个类的属性。如`getName`方法可以用来获取类的名字（包含其所在包信息），`forName`方法可以用来获取类名对应的`Class`对象：

```java
A a = new A();
System.out.println(a.getClass().getName()); // package.a

// 需抛出或处理ClassNotFoundException异常
Class<?> clz = Class.forName("main.A");

Class<?> clz = A.class;
```

**创建实例**：

```java
var className = "main.A";

Class clz = Class.forName(className);
Object obj = clz.getConstructor().newInstance();
```

**获取资源**：

```java
Class clz = ReflectionTest.class;
URL url = clz.getResource("index.properties");
```

**拷贝数组**（注意**数组是对象**）：

```java
public static Object copy(Object a, int newLength){
    Class clz = a.getClass();
    if(!clz.isArray()) return null;
    Class componentType = clz.getComponentType();
    int length = Array.getLength(a);
    Object newArray = Array.newInstance(componentType, newLength);
    System.arraycopy(a, 0, newArray, 0, Math.min(length, newLength));
    return newArray;
}
```

**执行方法**：

```java
public class ReflectionTest {
    public static void main(String[] args) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException, InstantiationException {
        Class clz = ReflectionTest.class;
        Method method = clz.getMethod("test", null);
        Object obj = clz.newInstance();
        method.invoke(obj, null);
    }

    public void test() {
        System.out.println("method invoke");
    }
}
```

利用`method`对象可以实现 C 语言中函数指针所能完成的所有操作，也能实现回调函数的功能，但这种编程风格并不优雅，而且很容易出错，需要多次强制类型转换，所以建议仅在绝对必要的情况下才引入`Method`对象，通常更好的做法是使用接口以及 lambda 表达式。

特别要强调，建议 Java 开发者不要使用回调函数的`Method`对象，可以使用回调的接口，这样不仅代码执行速度更快，也更易于维护。

## 结语

一些使用继承时的技巧：

1. 将公共操作和字段放在超类中；

2. 不要使用受保护（protected）的字段；

3. 使用继承实现`is-a`的关系，在无`is-a`关系时，可以考虑`has-a`方式；

4. 除非所有继承的方法都有意义，否则就不要使用继承。

5. 在覆盖方法时，不要改变**预期**的行为；

6. 使用多态，而不要根据类型判断执行过程；

7. 不要滥用反射。
