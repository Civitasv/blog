---
title: "Linux常用命令"
summary: "介绍Linux常用命令"
date: "2021-02-06"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

| 命令                   | 含义                                     |
|:----------------------:|:----------------------------------------:|
| 改变操作系统的字体大小 | `sudo dpkg-reconfigure console-setup`    |
| 修改 root 密码         | `sudo passwd root`                       |
| 切换 root 账号         | `su -` or `su root`                      |
| 更新 apt 包            | `apt-get update`                         |
| 安装 ssh-server 服务   | `apt-get install openssh-server`         |
| 卸载防火墙             | `ufw disable`和`apt-get remove iptables` |

## 注意

所有的 Linux 服务器都要使用 SSH 工具进行连接，方便使用。

## `NTP`组件配置

- 下载 NTP 组件：`apt-get install ntp ntpdate`

- 下载完成之后，需要找到一个时间服务器，`ntpdate -u ntp.aliyun.com`

## 下载编译开发包

常用开发库下载：`apt-get install gcc libpcre3 libpcrecpp* libpcre3-dev libssl-dev`

## 配置 FTP 服务

`FTP`是文件传输协议，项目的发布和维护需要进行频繁的修改，使用`FTP`服务可以进行代码文件的传输，**效率很高**。

- FTP 组件安装:`apt-get install vsftpd`

- 修改密码：`passwd ftp`

- 默认情况下，FTP 服务的默认上传目录为`/srv/ftp`，要想上传，必须将此目录设置为完全控制权限：`chmod 777 /srv/ftp`。

- `FTP`服务配置

  - 编辑文件：`vi /etc/vsftpd.conf`
  - 修改`write_enable`属性为`YES`（登录用户可以进行 FTP 写的处理）
  - 修改`chroot_local_user`属性为`YES`（用户的列表的显示都设置在主目录）
  - 修改`chroot_list_enable`属性为`YES`（用户可以查看所有的信息列表）
  - 打开`chroot_list_file=/etc/vsftpd.chroot_list`（启用配置列表项）

- 创建`/etc/vsftpd/chroot_list`文件信息

  - 打开文件：`vi /etc/vsftpd/chroot_list`
  - 将 ftp 用户名配置到此文件之中

- 打开`vi /etc/pam.d/vsftpd`，注释授权处理操作行

- 杀死已有的 ftp 进程

  - ps -ef | grep ftp：查询 Pid
  - kill 进程号

- 重启服务：`service vsftpd start`

- 查看 ftp 服务：`ftp://192.168.216.128:21`

## JDK 安装与配置

Linux 下具有一个自己专属的 OpenJDK。但本次还是自己安装。

1. 将 JDK 的 Linux 开发包通过 ftp 上传到服务器；

2. 解压缩至/usr/local 目录下：`tar xzvf /srv/ftp/jdk-8u281-linux-x64.tar.gz -C /usr/local`；

3. 修改文件名为 jdk：`mv jdk1.8.0_281 jdk`

4. 配置环境变量：

   - 打开环境配置文件：`vi /etc/profile`：

     ```java
     export JAVA_HOME=/usr/local/jdk
     export PATH=$PATH:$JAVA_HOME/bin:
     ```

   - 使配置文件立即生效：`source /etc/profile`

## 配置 MySQL 数据库

ubantu 系统中安装 MySQL 的最简单的方法是`apt-get install mysql`，可以直接通过网络安装，但无法自己确定版本。

如果想要安装不同版本的 MySQL，必须自己上传 MySQL 文件包和配置。

以`mysql-5.6.10-linux-glibc2.5-x86_64.tar.gz`进行测试。

1. 通过 ftp 上传至/srv/ftp 目录中；

2. 将`mysql`程序文件解压缩到`/usr/local`目录下；

3. 将解压缩后的 mysql 软件重命名为`mysql`；

4. 修改环境配置，将`mysql`中的可执行程序路径配置环境变量之中：`vi /etc/profile`

   ```java
   export MYSQL_HOME=/usr/local/mysql
   export PATH=$PATH:$MYSQL_HOME/bin:
   ```

5. 使配置立即生效：`source /etc/profile`；

6. 安装开发包：`apt-get install libaiol` `apt-get install libaio-dev`

7. 安装 Mysql，数据文件所在路径为`/usr/local/mysql/data`，进入`/usr/local/mysql/scripts`目录，执行：`mysql_install_db --user=root --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data`

8. 启动 MYSQL 服务：服务程序路径为`/usr/local/mysql/bin`，执行`mysqld_safe --user=root`，发现出错，需要编辑`/etc/hosts`文件，添加 ip 地址，命名为 localhost，再次修改，发现启动之后无法进行其它操作，该操作为前台启动，后台启动操作为：`nohup mysqld_safe --user==root > /dev/null 2>&1 &`

9. 检测 mysql 版本：`mysqladmin version`

10. 修改 root 账户密码为`senmeng0921`，首先登陆：`mysql -uroot -p`，注意当前密码为空，直接回车即可，修改密码操作为：`update mysql.user set password=PASSWORD('senmeng0921') where user='root'`，然后运行`flush privileges`使配置立即生效

11. 开启 mysql 服务的 root 账户的远程权限：`GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION`和`GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' identified by 'senmeng0921' WITH GRANT OPTION`，运行`flush privileges`进行刷新

12. 使用 navicat 可以测试与 mysql 的连接
