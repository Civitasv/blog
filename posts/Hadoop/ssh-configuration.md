---
title: "Linux配置ssh自动登录"
summary: "介绍Linux环境下配置ssh自动登录流程"
date: "2021-02-07"
author: "Civitasv"
categories:
  - hadoop
tags:
  - hadoop
---

1. 修改文件`/etc/hostname`，配置主机名称为：hadoop-alone，修改名称之后需要使用`reboot`命令进行重启；

2. 配置 hadoop 时，ip 地址不能发生改变，否则配置全部失效，建议在 hosts 文件里面进行主机的配置

   - 输入`ifconfig`查看 ip 地址
   - Hadoop 只能够在 Linux、Unix 下进行部署，所以需保证 IP 地址不会与局域网下的其它电脑冲突，所以在 VMWare 中选择 NAT 模式
   - 配置 hosts 文件，设置 ip 地址与主机名称的映射（建议配置），编辑文件/etc/hosts，添加：`192.168.216.128 hadoop-alone`

3. 配置免登录连接，需要建立 ssh 的登陆连接，这样在 hadoop 启动时不需要进行密码的输入：

   - 首先删除之前的 ssh 配置信息，执行`cd ~/`，如果已经配置了 ssh 连接，则会出现有`.ssh`目录，执行`rm -r ~/.ssh`删除该目录，然后执行`ssh-keygen -t rsa`生成新的 SSH Key 信息
   - 随后将此 ssh 的公钥信息保存至授权文件之中：`cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys`
   - 进行本机登陆的测试：`ssh root@hadoop-alone`，如果出现以下信息：

   ```java
   The authenticity of host 'hadoop-alone (192.168.216.128)' can't be established.
   ECDSA key fingerprint is SHA256:2cMNLSmDmLgV1K9qVuzOLnvb+iaPBCXHYYxmQz76IqM.
   Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
   Warning: Permanently added 'hadoop-alone,192.168.216.128' (ECDSA) to the list of known hosts.
   Welcome to Ubuntu 20.10 (GNU/Linux 5.8.0-38-generic x86_64)

   * Documentation:  https://help.ubuntu.com
   * Management:     https://landscape.canonical.com
   * Support:        https://ubuntu.com/advantage

   8 updates can be installed immediately.
   0 of these updates are security updates.
   To see these additional updates run: apt list --upgradable

   Last login: Tue Jan 26 21:57:32 2021 from 192.168.216.1

   ```

   则说明 ssh 配置已经成功。
