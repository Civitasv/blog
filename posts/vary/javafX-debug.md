---
title: "JavaFX Run And Debug With Intellij"
summary: "在 Jdk8 中，运行和调试 JavaFx 毫无难度，和平常的 Java 程序没有什么区别，但是，从 Jdk11 开始，JavaFx 作为独立模块从 Jdk 中分离了出来，运行和调试（尤其是调试）变得不那么容易，因此，博主在经历一番探索后，找到了一种十分简单的基于 IDEA + Maven + JDK11 运行和调试 JavaFx 程序的方法"
date: "2021-04-14"
author: "Civitasv"
categories:
  - java 
tags:
  - javafx
  - idea
  - maven
---

在 Jdk8 中，运行和调试 JavaFx 毫无难度，和平常的 Java 程序没有什么区别，但是，从 Jdk11 开始，JavaFx 作为独立模块从 Jdk 中分离了出来，运行和调试（尤其是调试）变得不那么容易，因此，博主在经历一番探索后，找到了一种十分简单的基于**IDEA + Maven + JDK11**运行和调试 JavaFx 程序的方法。

## 新建 Maven 项目

1. 在 IDEA 中新建项目，选择`Maven`，勾选`Create from archetype`，选择`javafx-maven-archetypes`，如果没有，选择`Add archetype`添加，参数设置为：

   - GroupId：`org.openjfx`
   - artifactId：`javafx-maven-archetypes`
   - version：`0.0.5`
     选择后点击`next`。

2. 设置项目名称、保存位置、`GroupId`、`ArtifactId` 和 `Version`
   ![新建项目](/img/in-post/javafx/javafx_新建项目.png)

3. 设置 `archetype artifactId`，有两个可选项：`javafx-archetype-fxml` 和 `javafx-archetype-simple`，表示是否添加 fxml 支持，在这里我选取`javafx-archetype-simple`，然后新建`javafx-version`属性，定义为 15.0.1
   ![新建项目](/img/in-post/javafx/javafx_maven_set.png)

4. 点击 finish，等待下载

5. 生成的 pom 文件为[Here](https://github.com/Civitasv/hellofx/blob/master/pom.xml)

6. `module-info`文件是 Java9 引入的模块化系统，如下所示

   ```java
   module com.civitasv {
       requires javafx.controls;
       exports com.civitasv;
   }
   ```

7. 如果添加 fxml 支持，则需要添加 `java-fxml` 依赖并在 module-info 文件中添加：

   ```java
   requires javafx.fxml;
   opens com.civitasv.controller to javafx.fxml;
   ```

   注：这是因为 FXML 类使用反射机制调用项目中的 controller，具体请查阅 Java 模块化机制。

## 运行和调试

此时可以直接点击运行和调试`App`。

运行结果如下：
![运行结果](/img/in-post/javafx/javafx_run.png)

## 总结

创建 Java 模块化项目就可以了，不过还不知道其中的深层次原因。
