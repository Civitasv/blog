---
title: "搭建Hadoop分布式集群"
summary: "Hadoop 从最初设计就是为了集群存在的，所以针对 Hadoop 而言，它的集群搭建是很容易的，且在 Hadoop 设计之中，充分考虑到了数据节点（`DataNode`）的动态扩充问题"
date: "2021-02-15"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

Hadoop 从最初设计就是为了集群存在的，所以针对 Hadoop 而言，它的集群搭建是很容易的，且在 Hadoop 设计之中，充分考虑到了数据节点（`DataNode`）的动态扩充问题。

## 分布式集群搭建的概述

在 Hadoop 里面进程分为两类： + DFS 进程：NameNode、SecondaryNameNode、DataNode + YARN 进程：ResouceManager、NodeManager

从理论上将应该搭建两套集群：DFS 集群、YARN 集群。

Hadoop 单 NameNode 标准集群：

![Hadoop单NameNode标准集群](/img/in-post/hadoop/Hadoop单NameNode标准集群.png)

如果按照以上方式搭建集群主机太多，所以建议将`DFS`和`YARN`进程混合在一起，也就是说让`NameNode`和`ResouceManager`在一个节点，`DataNode`和`NodeManager`在一个节点。

![搭建分布式集群](/img/in-post/hadoop/搭建分布式集群.png)

为了能够体现出`Hadoop`集群的配置优势，所以单独新建一个新的主机以进行`DataNode`节点的扩充。

## 2.2 配置六台主机的信息

1. 将主机拷贝六份完整备份，建议每台虚拟机分配 1G 的内存。
   ![六台主机](/img/in-post/hadoop/六台主机.png)
2. 需要确定每台主机的 ip 地址以及修改主机名称
   - 查看 ip：`ifconfig`，在 xshell 中使用该 ip 建立连接
     |名称|ip|
     |:--:|:--:|
     |hadoop-namenode|192.168.216.129|
     |hadoop-secondarynamenode|192.168.216.130|
     |hadoop-datanode-slave1|192.168.216.131|
     |hadoop-datanode-slave2|192.168.216.132|
     |hadoop-datanode-slave3|192.168.216.133|
     |hadoop-datanode-slave-back|192.168.216.134|
   - 修改每台主机的主机名称：`vi /etc/hostname`，修改之后需要重新启动
3. 修改 hadoop-namenode 主机的 hosts 文件，设置所有的`secondarynamenode`、`datanode`主机信息，但是不包括动态扩充的`hadoop-datanode-slave-back`：`vi /etc/hosts`

   ```text
   192.168.216.129 hadoop-namenode
   192.168.216.130 hadoop-secondarynamenode
   192.168.216.131 hadoop-datanode-slave1
   192.168.216.132 hadoop-datanode-slave2
   192.168.216.133 hadoop-datanode-slave3
   ```

4. 将 hadoop-namenode 中的 hosts 文件拷贝到其他主机中，不包括`hadoop-datanode-slave-back`主机，或直接修改

5. 所有的操作最终都将通过`hadoop-namenode`主机发出，所以需要为每台主机配置 ssh 免登陆操作

这样一来就完成了基本的主机配置。

## 2.3 配置 NameNode 主机

在`NameNode`主机首先进行配置，然后拷贝到其它主机之中。

1. 将`Hadoop`的开发包上传到主机（`hadoop-namenode`），随后将其解压缩到`/usr/local`目录之中；
2. 将解压缩后的`hadoop 2.10.1`文件夹更名为`hadoop`；
3. 编辑环境变量文件，追加`hadoop`的相关环境配置：`vi /etc/profile`，然后使配置文件立即生效；
4. 本次在`hadoop`初期启动的过程里面一定需要准备出所有的从节点的主机列表，需要修改`slaves`文件增加所有的从结点（增加的是所有随主节点一起增加的从节点的名称，不包括动态增加的），`vi /usr/local/hadoop/etc/hadoop/slaves`

   ```text
   hadoop-datanode-slave1
   hadoop-datanode-slave2
   hadoop-datanode-slave3
   ```

5. 修改 hadoop 的环境属性，增加`JDK`的配置：`vi /usr/local/hadoop/etc/hadoop/hadoop-env.sh`，增加`export JAVA_HOME=/usr/local/jdk`

6. 修改`core-site.xml`文件：`vi /usr/local/hadoop/etc/hadoop/core-site.xml`，修改`fs:defaultFS`属性为主机名称

   ```xml
   <configuration>
       <property>
           <name>hadoop.tmp.dir</name>
           <value>/usr/data/hadoop/tmp</value>
           <description></description>
       </property>
       <property>
           <name>fs.defaultFS</name>
           <value>hdfs://hadoop-namenode:9000</value>
       </property>
   </configuration>
   ```

7. 修改`hdfs-site.xml`文件：`vi /usr/local/hadoop/etc/hadoop/hdfs-site.xml`，需要修改`dfs.replication`属性值为 3，因为此时的`datanode`有 3 个

   ```xml
   <configuration>
       <property>
           <name>dfs.replication</name>
           <value>3</value>
       </property>
       <property>
           <name>dfs.namenode.name.dir</name>
           <value>file:///usr/data/hadoop/dfs/name</value>
       </property>
       <property>
           <name>dfs.datanode.data.dir</name>
           <value>file:///usr/data/hadoop/dfs/data</value>
       </property>
       <property>
           <name>dfs.namenode.http-address</name>
           <value>hadoop-namenode:50070</value>
       </property>
       <property>
           <name>dfs.namenode.secondary.http-address</name>
           <value>hadoop-secondarynamenode:50090</value>
       </property>
       <property>
           <name>dfs.permissions</name>
           <value>false</value>
       <property>
   </configuration>
   ```

8. 修改`yarn-site`文件，`vi /usr/local/hadoop/etc/hadoop/yarn-site.xml`

   ```xml
   <configuration>
       <property>
           <name>yarn.resourcemanager.admin.address</name>
           <value>hadoop-namenode:8033</value>
       </property>
       <property>
           <name>yarn.nodemanager.aux-services</name>
           <value>mapreduce_shuffle</value>
       </property>
       <property>
           <name>yarn.nodemanager.aux-services.mapreduce_shuffle.class</name>
           <value>org.apache.hadoop.mapred.ShuffleHandler</value>
       </property>
       <property>
           <name>yarn.resourcemanager.resource-tracker.address</name>
           <value>hadoop-namenode:8025</value>
       </property>
       <property>
           <name>yarn.resourcemanager.scheduler.address</name>
           <value>hadoop-namenode:8030</value>
       </property>
       <property>
           <name>yarn.resourcemanager.address</name>
           <value>hadoop-namenode:8050</value>
       </property>
       <property>
           <name>yarn.resourcemanager.scheduler.address</name>
           <value>hadoop-namenode:8030</value>
       </property>
       <property>
           <name>yarn.resourcemanager.webapp.address</name>
           <value>hadoop-namenode:8088</value>
       </property>
       <property>
           <name>yarn.resourcemanager.webapp.https.address</name>
           <value>hadoop-namenode:8090</value>
       </property>
   </configuration>
   ```

9. 随后创建相关的文件保存目录：
   1. 创建 tmp 文件目录：`mkdir -p /usr/data/hadoop/tmp`
   2. 创建 dfs-name 文件目录：`mkdir -p /usr/data/hadoop/dfs/name`
   3. 创建 dfs-data 文件目录：`mkdir -p /usr/data/hadoop/dfs/data`

## 2.4 配置子节点主机

1. 所有通过`NameNode`主机配置的节点信息都需要通过`start-dfs.sh`和`stop-dfs.sh`两个命令来进行启动或关闭，所以为了能够自动的打开或关闭，必须存在一个`pid`文件路径，hadoop 默认会将`pid`路径放置在`/tmp`目录下，但这样一段时间后该目录的内容会被情况，所以用户需要自己来指派相应的路径信息

   1. 修改`hadoop-daemon.sh`文件：`vi /usr/local/hadoop/sbin/hadoop-daemon.sh`

      ```text
      if [ "$HADOOP_PID_DIR" = "" ]; then
          HADOOP_PID_DIR=/usr/data/hadoop/pids
      fi
      ```

   2. 修改`yarn-daemon.sh`文件：`vi /usr/local/hadoop/sbin/yarn-daemon.sh`

      ```text
      if [ "$YARN_PID_DIR" = "" ]; then
          YARN_PID_DIR=/usr/data/hadoop/yarn_pids
      fi
      ```

   3. 拷贝到其他主机（如果遗忘）

2. 将`NameNode`的`hadoop`配置目录以及`/etc/profile`文件拷贝到所有的主机上（包括动态备份主机）
   1. scp -r /usr/local/hadoop/ hadoop-secondarynamenode:/usr/local/
   2. scp -r /etc/profile hadoop-secondarynamenode:/etc/
3. 登录到所有的主机，使配置文件立即生效：`source /etc/profile`
4. 对 NameNode 主机进行 namenode 节点格式化：`hdfs namenode -format`
5. 启动`hdfs`节点信息，此时各个子结点都保存有相同的配置文件，会自动调用这些配置文件自己启动相应的进程：`start-dfs.sh`

   ```text
   hadoop-namenode: starting namenode, logging to /usr/local/hadoop/logs/hadoop-root-namenode-hadoop-namenode.out
   hadoop-datanode-slave3: starting datanode, logging to /usr/local/hadoop/logs/hadoop-root-datanode-hadoop-datanode-slave3.out
   hadoop-datanode-slave2: starting datanode, logging to /usr/local/hadoop/logs/hadoop-root-datanode-hadoop-datanode-slave2.out
   hadoop-datanode-slave1: starting datanode, logging to /usr/local/hadoop/logs/hadoop-root-datanode-hadoop-datanode-slave1.out
   Starting secondary namenodes [hadoop-secondarynamenode]
   hadoop-secondarynamenode: starting secondarynamenode, logging to /usr/local/hadoop/logs/hadoop-root-secondarynamenode-hadoop-secondarynamenode.out
   ```

   随后可以使用 jps 命令可以查看各主机的信息

   踩坑记录：注意`DataNode`节点中不能配置`dfs-name`和`dfs-data`文件目录，否则`DataNode`节点无法启动

6. 打开网页后台管理界面：`http://192.168.216.129:50070/`（`NameNode`）

   ![网页信息管理界面](/img/in-post/hadoop/网页信息管理界面.png)

   可以观察到三个数据节点。此时一个真正的集群环境就搭建完成了！

7. `hadoop-namenode`上传文件测试：`hadoop fs -put /srv/ftp/hadoop-2.10.1.tar.gz /`

   ![集群文件上传测试](/img/in-post/hadoop/集群文件上传测试.png)

   上传完成之后继续查看 HDFS 结构会出现有可以使用的下载地址，且此时文件备份了三份，所以此时可以通过三台`DataNode`节点下载所需要的数据文件。

   ![集群文件下载](/img/in-post/hadoop/集群文件下载.png)

8. 启动 YARN 相关进程：`start-yarn.sh`

   ```text
   starting yarn daemons
   starting resourcemanager, logging to /usr/local/hadoop/logs/yarn-root-resourcemanager-hadoop-namenode.out
   hadoop-datanode-slave3: starting nodemanager, logging to /usr/local/hadoop/logs/yarn-root-nodemanager-hadoop-datanode-slave3.out
   hadoop-datanode-slave2: starting nodemanager, logging to /usr/local/hadoop/logs/yarn-root-nodemanager-hadoop-datanode-slave2.out
   hadoop-datanode-slave1: starting nodemanager, logging to /usr/local/hadoop/logs/yarn-root-nodemanager-hadoop-datanode-slave1.out
   ```

到这里为止，我们就完成了实际开发之中所使用的`Hadoop`的运行环境。

## 动态扩充 DataNode

现在已经成功的实现基础的 Hadoop 集群的搭建，但是需要记住，此时只是考虑了软件性能，但并没有考虑硬件性能（需要搞硬件的来）。

Hadoop 里面的最大亮点是可以由用户自动的进行`DatNode`节点的追加控制，以实现存储的扩充。Hadoop 的最大亮点是可以在不关机的状态下实现动态的节点扩充操作。以`hadoop-datanode-slave-back`主机为例进行配置。

1. 为了配置方便（因为所有的配置都使用了主机名称），修改`hadoop-datanode-slave-back`主机`hosts`文件追加`NameNode`和本机相关信息

   ```text
   192.168.216.129 hadoop-namenode
   192.168.216.134 hadoop-datanode-slave-back
   ```

2. 修改`hadoop-datanode-slave-back`主机`hadoop`的核心配置文件`core-site.xml`：`vi /usr/local/hadoop/etc/hadoop/core-site.xml`，添加如下属性：

   ```xml
   <property>
       <name>fs.defaultFS</name>
       <value>hdfs://hadoop-namenode:9000</value>
   </property>
   ```

3. `hadoop-namenode`主机配置`hadoop-datanode-slave-back`主机主机名称：`vi /etc/hosts`

   ```text
   192.168.216.134 hadoop-datanode-slave-back
   ```

4. 启动 datanode 节点：`hadoop-daemon.sh start datanode`

   ![动态追加节点](./img/in-post/hadoop/动态追加节点.png)

   此时查看后台网络管理器可以发现该节点已经出现了。

5. 此时上传文件会由`NameNode`动态的选择相应的`DataNode`进行数据的保存

6. 查看丢包率：`hadoop fsck -locations`

   ```text
   Connecting to namenode via http://hadoop-namenode:50070/fsck?ugi=root&locations=1&path=%2F
   FSCK started by root (auth:SIMPLE) from /192.168.216.129 for path / at Fri Jan 29 05:35:54 PST 2021
   .Status: HEALTHY
   Total size:  408587111 B
   Total dirs:  1
   Total files:  1
   Total symlinks:  0
   Total blocks (validated):  4 (avg. block size 102146777 B)
   Minimally replicated blocks:  4 (100.0 %)
   Over-replicated blocks:  0 (0.0 %)
   Under-replicated blocks:  0 (0.0 %)
   Mis-replicated blocks:  0 (0.0 %)
   Default replication factor:  3
   Average block replication:  3.0
   Corrupt blocks:  0
   Missing replicas:  0 (0.0 %)
   Number of data-nodes:  4
   Number of racks:  1
   FSCK ended at Fri Jan 29 05:35:54 PST 2021 in 7 milliseconds


   The filesystem under path '/' is HEALTHY
   ```

此时即使某个节点宕机了，其他的主机仍然可以给我们提供服务，这就是分布式的好处。
