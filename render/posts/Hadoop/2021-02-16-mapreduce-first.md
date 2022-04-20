---
title: "MapReduce 基本操作"
summary: "搭建集群最终都是为了进行数据分析，在整个Hadoop体系之中，只有一种程序需要我们来编写：MapReduce。map表示数据处理，reduce表示数据分析"
date: "2021-02-16"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

搭建集群最终都是为了进行数据分析，在整个`Hadoop`体系之中，只有一种程序需要我们来编写：`MapReduce`。`map`表示数据处理，`reduce`表示数据分析。

## MapReduce 基本原理

`MapRecude`是一种需要在`Hadoop`集群上执行的分析程序，它用于分析在`HDFS`上所保存的相关数据，下面使用`MapReduce`实现单词统计功能。

1. 准备一个普通的文本文件：`word.txt`，保存至`/usr/local/`目录之中。

   ```text
   Hello MLDN Hello Yootk
   Hello Bye Bye Bye
   Hello MLDN
   ```

   将该文件保存至`hadoop-namenode`中。

2. 将此文件保存至`hdfs`之中

   - 保存在`/input`文件目录之中：`hadoop fs -mkdir /input`
   - 将`word.txt`保存至`/input`目录之中：`hadoop fs -put /usr/local/word.txt /input`

3. MapReduce 处理流程如下图所示：

   ![MapReduce处理流程](/img/in-post/hadoop/MapReduce处理流程.png)

   1. 如果想要对数据进行分析，首先要有数据，该数据需要保存至`HDFS`上
   2. 将输入的数据拆分成`key-value`键值对（如按行拆分）
   3. 将`key-value`结构转换为`Map`保存（`Mapper`处理阶段）
   4. 对 Map 阶段得到的数据进行排序处理（为了更快的合并）
   5. 合并处理
   6. 统计处理（`Reducer`处理阶段），对相同的`key`的所有值进行统计计算

   - Map 操作--一般是对文件的一行进行处理（拆分也是有规则的），能够获取这一行的相关信息，会输出一个个的 key-value 值
   - 排序操作--为了聚合更快
   - 聚合操作--Map 操作输出的 key-value 中，key 可能重复，聚合结果为 key-[value1,value2,...]
   - reduce 操作--处理具备相同 key 的所有 value，得到统计结果

   在整个流程中，只有`Map`阶段以及`Reduce`阶段需要程序开发人员负责

## 编写 Map 处理操作

在`Hadoop`之中提供有`MapReduce`的开发包，可以通过`maven`进行获取。

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-common</artifactId>
        <version>${hadoopVersion}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-hdfs</artifactId>
        <version>${hadoopVersion}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-mapreduce-client-core</artifactId>
        <version>${hadoopVersion}</version>
    </dependency>
    <dependency>
        <groupId>org.apache.hadoop</groupId>
        <artifactId>hadoop-client</artifactId>
        <version>${hadoopVersion}</version>
    </dependency>
</dependencies>
```

下面开发`Mapper`程序类：

在通过 hdfs 读取数据的时候，每一次执行`Mapper`接受的是一行数据

所有的`Mapper`处理类都需要继承一个父类：`org.apache.hadoop.mapreduce.Mapper`，该类接收四个泛型：

- KEYIN：输入数据的 KEY（用处不大）
- VALUEIN：表示真实输入的一行数据
- KEYOUT：输出数据的 Map 中的 KEY 类型，`Hadoop`中使用`Text`描述字符串
- VALUEOUT：输出数据的 Map 中的 Value 的类型，`Hadoop`中使用`IntWritable`描述数字

![Map处理阶段](/img/in-post/hadoop/Map处理阶段.png)

```java
/**
 * 针对于每一行发送的数据进行拆分处理，将每一行的数据拆分为key与value的形式
 * 输出类型：单词名称=数量（1）
 * 输入类型：目前仅关注value的内容
 */
private static class WordCountMapper extends Mapper<Object, Text, Text,IntWritable> {
    @Override
    protected void map(Object key, Text value, Context context) throws IOException, InterruptedException {
        // 读取每一行的数据，Map根据换行作为分隔符
        String str = value.toString(); // 取得每一行的内容
        // 按空格拆分单词
        String[] results = str.split(" ");
        for (String result : results) {
            context.write(new Text(result), new IntWritable(1)); // 将数据取出
        }
    }
}
```

## 编写 Reduce 处理操作

对 Map 的数据进一步处理称为`Reduce`操作。

下面实现单词统计的`Reduce`处理操作，需要继承`org.apache.hadoop.mapreduce.Reducer`类，该类同样具有四个泛型定义：

- KEYIN：与 Map 处理完成后输出的 key 类型相同
- VALUEIN：与 Map 处理完成后输出的 value 类型相同
- KEYOUT：Reduce 输出的 key 的类型
- VALUEOUT：Reduce 输出的 value 的类型

![Reduce处理阶段](/img/in-post/hadoop/Reduce处理阶段.png)

```java
/**
 * 实现Reduce单词统计量操作
 */
private static class WordCountReducer extends Reducer<Text, IntWritable,Text, IntWritable> {
    @Override
    protected void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
        int sum = 0; // 统计值
        for (IntWritable writable : values) { // 取出所有的统计数据
            sum += writable.get(); // 数据的累加处理
        }
        context.write(new Text(key), new IntWritable(sum));
    }
}
```

## 定义 job

`MapReduce`步骤对于`Hadoop`而言相当于启动了一个作业，开发者需要指定作业所使用的`Map`和`Reduce`操作

下面针对单词统计定义作业：

```java
public static void main(String[] args) throws IOException,ClassNotFoundException, InterruptedException {
    if (args.length != 2) { // 输入参数个数不足，需要退出程序
        System.out.println("需要两个参数");
        System.exit(1);
    }
    Configuration configuration = new Configuration();
    String[] paths = new GenericOptionsParser(configuration, args).getRemainingArgs(); // 将输入的两个路径解析为HDFS的路径
    Job job = Job.getInstance(configuration, "word count"); // 创建一个作业
    job.setJarByClass(WordCountDemo.class); // 定义作业执行的类名称
    job.setMapperClass(WordCountMapper.class); // 定义作业使用的Mapper类
    job.setMapOutputKeyClass(Text.class); // 定义Mapper输出数据的key的类型
    job.setMapOutputValueClass(IntWritable.class); // 定义Mapper输出数据的value的类型
    job.setReducerClass(WordCountReducer.class); // 定义作业使用的Reducer类
    job.setOutputKeyClass(Text.class); // 输出统计结果的key类型
    job.setOutputValueClass(IntWritable.class); // 输出统计结果的value类型
    FileInputFormat.addInputPath(job, new Path(paths[0])); // 定义输入的hdfs路径
    FileOutputFormat.setOutputPath(job, new Path(paths[1]));  // 定义输出路径
    System.exit(job.waitForCompletion(true) ? 0 : 1); // 程序执行完毕后退出
}
```

## 执行作业

要想执行作业，需要将程序变为`jar`文件，发送到服务器执行。

1. 打包项目为`wordcount.jar`文件
2. 通过 ftp 将程序文件上传到`hadoop`服务器上
3. 在`hadoop`服务器运行：`hadoop jar /srv/ftp/wordcount.jar /input/word.txt /output`
4. 如果执行成功会得到两个文件`_SUCCESS`和`part-r-00000`，`part-r-00000`文件中即是统计结果

## 读取统计结果

编写 Java 程序类读取统计结果到本地显示。

读取路径：hdfs://192.168.216.129:9000/output/

```java
public static void main(String[] args) throws IOException {
    String hdfsUrl = "hdfs://192.168.216.129:9000/output/";
    Configuration configuration = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(hdfsUrl), configuration); // 定义读取的数据类
    // 取得HDFS指定目录中的所有内容
    FileStatus[] status = fs.listStatus(new Path(hdfsUrl));
    for (FileStatus fileStatus : status) {
        String fileName = fileStatus.getPath().getName(); // 读取文件名
        if (fileName.startsWith("part-")) {
            FSDataInputStream input = fs.open(fileStatus.getPath());
            Scanner scanner = new Scanner(input);
            scanner.useDelimiter("\n");
            while (scanner.hasNext())
                System.out.println(scanner.next());
        }
    }
    fs.close();
}
```
