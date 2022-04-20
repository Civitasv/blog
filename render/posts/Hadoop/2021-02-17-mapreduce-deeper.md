---
title: "MapReduce 深入操作"
summary: "在实际的系统开发过程中，文件的组成结构可能会非常的复杂，因此Hadoop允许用户针对于个人需求自定义数据类型"
date: "2021-02-17"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

## 自定义数据类型

在实际的系统开发过程中，文件的组成结构可能会非常的复杂，因此`Hadoop`允许用户针对于个人需求自定义数据类型。

假设某文件组织方式为：

```text
用户名、省份、城市、购买日期时间、商品名称、商品分类、商品子分类、商品价格、商品购买价格
```

详细数据为：

```text
mldn,北京,北京,2016-10-10 19:20:32,Java开发实战经典,编程语言,Java,79.8,69.8
mldn,北京,北京,2016-10-10 19:21:32,JavaWeb开发实战经典,编程语言,Java,69.8,57.6
mldn,北京,北京,2016-10-10 19:21:32,Oracle开发实战经典,数据库,Oracle,88.8,72.3
mldn,北京,北京,2016-10-09 16:35:33,Word轻松学,办公软件,Word,67.6,60.2
yootk,河北,石家庄,2016-10-10 19:21:32,Linux开发实战经典,操作系统,Linux,65.3,55.3
yootk,河北,石家庄,2016-10-10 19:21:32,Linux服务搭建,操作系统,Linux,99.1,79.5
yootk,河北,石家庄,2016-10-10 19:23:32,Linux防火墙配置,操作系统,Linux,105.8,80.9
yootk,河北,石家庄,2016-10-10 19:25:32,Java开发实战经典,编程语言,Java,79.8,68.8
yootk,河北,石家庄,2016-10-10 19:27:32,Oracle开发实战经典,数据库,Oracle,88.8,70.5
lee,河南,洛阳,2016-10-09 20:30:32,教你学做PPT,办公软件,PPT,39.5,19.2
lee,河南,洛阳,2016-10-09 16:31:32,30分钟学会Excell,办公软件,Excell,38.2,30.1
lee,河南,洛阳,2016-10-09 16:32:32,Word随便用,办公软件,Word,37.1,20.1
lee,河南,洛阳,2016-10-09 16:35:32,Word轻松学,办公软件,Word,27.6,21.2
```

希望获取以下信息：

- 保留省份信息的花销
- 保留用户信息的花销
- 保留商品分类信息的花销

花销指商品原始价格、商品成交价格和商品折扣，此时必须自定义数据类型

要想自定义数据类型，该类型必须实现`org.apache.hadoop.io.Writable`接口

下面定义一个描述价格的类型：

```java
import org.apache.hadoop.io.Writable;

import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;

public class RecordWritable implements Writable {
    private double price; // 商品价格
    private double dealPrice; // 商品成交价格
    private double discount; // 商品折扣

    public RecordWritable() {
        // 必须提供无参构造器
    }

    public RecordWritable(double price, double dealPrice, double discount) {
        this.price = price;
        this.dealPrice = dealPrice;
        this.discount = discount;
    }

    @Override
    public void write(DataOutput dataOutput) throws IOException {
        dataOutput.writeDouble(price);
        dataOutput.writeDouble(dealPrice);
        dataOutput.writeDouble(discount);
    }

    @Override
    public void readFields(DataInput dataInput) throws IOException {
        // 必须按照顺序
        this.price = dataInput.readDouble();
        this.dealPrice = dataInput.readDouble();
        this.discount = dataInput.readDouble();
    }

    @Override
    public String toString() {
        return "RecordWritable{" +
                "price=" + price +
                ", dealPrice=" + dealPrice +
                ", discount=" + discount +
                '}';
    }

    public double getPrice() {
        return price;
    }

    public double getDealPrice() {
        return dealPrice;
    }

    public double getDiscount() {
        return discount;
    }
}
```

下面获取根据省份数据得到的统计结果。

### 定义 Map 数据处理

```java
/**
 * 针对于每一行发送的数据进行拆分处理，将每一行的数据拆分为key与value的形式
 * 输出类型：省份:花销信息
 * 输入类型：目前仅关注value的内容
 */
private static class RecordMapper extends Mapper<Object, Text, Text, RecordWritable> {
    @Override
    protected void map(Object key, Text value, Context context) throws IOException, InterruptedException {
        // 读取每一行的数据，Map根据换行作为分隔符
        String str = value.toString(); // 取得每一行的内容
        // 按逗号拆分数据
        String[] results = str.split(",");
        // 获取省份
        String province = results[1];
        double price = Double.parseDouble(results[7]); // 原始价格
        double deal = Double.parseDouble(results[8]); //成交价格
        context.write(new Text(province), new RecordWritable(price, deal, price - deal)); // 将数据取出
    }
}
```

## 定义 Reduce 数据处理

```java
/**
 * 实现Reduce操作
 */
private static class RecordReducer extends Reducer<Text, RecordWritable, Text, RecordWritable> {
    @Override
    protected void reduce(Text key, Iterable<RecordWritable> values, Context context) throws IOException, InterruptedException {
        double price = 0; // 价格
        double deal = 0;// 成交价格
        double discount = 0;// 折扣价格
        for (RecordWritable writable : values) { // 取出所有的统计数据
            price += writable.getPrice(); // 数据的累加处理
            deal += writable.getDealPrice(); // 数据的累加处理
            discount += writable.getDiscount(); // 数据的累加处理
        }
        context.write(key, new RecordWritable(price, deal, discount));
    }
}
```

### 定义作业

```java
public static void main(String[] args) throws IOException, ClassNotFoundException, InterruptedException {
    if (args.length != 2) { // 输入参数个数不足，需要退出程序
        System.out.println("需要两个参数");
        System.exit(1);
    }
    Configuration configuration = new Configuration();
    String[] paths = new GenericOptionsParser(configuration, args).getRemainingArgs(); // 将输入的两个路径解析为HDFS的路径
    Job job = Job.getInstance(configuration, "record analysis"); // 创建一个作业
    job.setJarByClass(RecordDemo.class); // 定义作业执行的类名称
    job.setMapperClass(RecordMapper.class); // 定义作业使用的Mapper类
    job.setMapOutputKeyClass(Text.class); // 定义Mapper输出数据的key的类型
    job.setMapOutputValueClass(RecordWritable.class); // 定义Mapper输出数据的value的类型
    job.setReducerClass(RecordReducer.class); // 定义作业使用的Reducer类
    job.setOutputKeyClass(Text.class); // 输出统计结果的key类型
    job.setOutputValueClass(RecordWritable.class); // 输出统计结果的value类型
    FileInputFormat.addInputPath(job, new Path(paths[0])); // 定义输入的hdfs路径
    FileOutputFormat.setOutputPath(job, new Path(paths[1]));  // 定义输出路径
    System.exit(job.waitForCompletion(true) ? 0 : 1); // 程序执行完毕后退出
}
```

### 使用

将此文件编译为`record.jar`文件，上传至`hadoop`集群中，运行`hadoop fs -rm /input/word.txt`删除所有 hadoop 集群上的文件，运行`hadoop fs -put /srv/ftp/*.txt /input`提交需要分析的文件，运行`hadoop jar /srv/ftp/record.jar /input/*.txt /output-record`进行分析

```text
北京    RecordWritable{price=306.0, dealPrice=259.90000000000003, discount=46.09999999999999}
河北    RecordWritable{price=438.8, dealPrice=355.0, discount=83.79999999999998}
河南    RecordWritable{price=142.4, dealPrice=90.6, discount=51.800000000000004}
```

## 数据分区

所谓分区是可以根据某一种字段的内容来进行汇总处理，如在商品信息分析例子中可以按照省份进行分区

下面实现按省份的分区处理，需要使用`org.apache.hadoop.mapreduce.Partitioner<KEY,VALUE>`类

- KEY：表示分区的依据，与 Reduce 结果的 KEY 相同；
- VALUE：表示分区的值，与 Reduce 结果的 VALUE 相同

代码如下：

```java
private static class RecordPartitioner extends Partitioner<Text, RecordWritable> {
    @Override
    public int getPartition(Text key, RecordWritable value, int i) {
        if ("北京".equals(key.toString()))
            return 0;
        else if ("河北".equals(key.toString()))
            return 1;
        else if ("河南".equals(key.toString()))
            return 2;
        return 0;
    }
}

public static void main(String[] args) throws IOException, ClassNotFoundException, InterruptedException {
    if (args.length != 2) { // 输入参数个数不足，需要退出程序
        System.out.println("需要两个参数");
        System.exit(1);
    }
    Configuration configuration = new Configuration();
    String[] paths = new GenericOptionsParser(configuration, args).getRemainingArgs(); // 将输入的两个路径解析为HDFS的路径
    Job job = Job.getInstance(configuration, "record analysis"); // 创建一个作业
    job.setJarByClass(RecordDemo.class); // 定义作业执行的类名称
    job.setMapperClass(RecordMapper.class); // 定义作业使用的Mapper类
    job.setMapOutputKeyClass(Text.class); // 定义Mapper输出数据的key的类型
    job.setMapOutputValueClass(RecordWritable.class); // 定义Mapper输出数据的value的类型
    job.setReducerClass(RecordReducer.class); // 定义作业使用的Reducer类
    job.setOutputKeyClass(Text.class); // 输出统计结果的key类型
    job.setOutputValueClass(RecordWritable.class); // 输出统计结果的value类型
    job.setPartitionerClass(RecordPartitioner.class); // 设置分区处理类
    job.setNumReduceTasks(3); // 启动三个Reduce任务实现分区处理
    FileInputFormat.addInputPath(job, new Path(paths[0])); // 定义输入的hdfs路径
    FileOutputFormat.setOutputPath(job, new Path(paths[1]));  // 定义输出路径
    System.exit(job.waitForCompletion(true) ? 0 : 1); // 程序执行完毕后退出
}
```

然后上传 jar 到服务器集群执行就行了
