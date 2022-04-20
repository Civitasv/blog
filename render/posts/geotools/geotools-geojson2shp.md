---
title: "使用GeoTools进行GeoJSON和Shp的互相转换"
summary: "GeoTools 是基于 OGC 规范的开源 Java GIS 库，支持如 csv、geojson、shapefile、wfs 等矢量数据格式的读取和转换，本文介绍如何使用 GeoTools 实现geojson 与 shp 数据的相互转换"
date: "2021-04-26"
author: "Civitasv"
categories:
  - geotools
tags:
  - geotools
  - geojson
  - shp
---

## 问题背景

最近在做的软件[POIKit](https://civitasv.github.io/AMapPoi/)需要提供 geojson 与 shp 数据的相互转换，考虑使用 GeoTools 实现该功能，GeoTools 是基于 OGC 规范的开源 Java GIS 库，支持如 csv、geojson、shapefile、wfs 等矢量数据格式的读取和转换，但官网仅提供了关于[csv 转换至 shp](https://docs.geotools.org/latest/userguide/tutorial/feature/csv2shp.html)的教程，国内外关于二者数据转换的文章也不太丰富，经过了一番挫折之后，我找到了一种实现二者互相转换的简单方式。

## 使用 Maven 安装 geotools

本次使用 Maven 构建，pom.xml 中关于 geotools 的引用如下：

```xml
<repositories>
    <repository>
        <id>osgeo</id>
        <name>OSGeo Release Repository</name>
        <url>https://repo.osgeo.org/repository/release/</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
        <releases>
            <enabled>true</enabled>
        </releases>
    </repository>
</repositories>
<properties>
    <geotools.version>25.0</geotools.version>
</properties>
<dependency>
    <!-- shapefile组件 -->
    <groupId>org.geotools</groupId>
    <artifactId>gt-shapefile</artifactId>
    <version>${geotools.version}</version>
</dependency>
<dependency>
    <!-- geojson组件 -->
    <groupId>org.geotools</groupId>
    <artifactId>gt-geojson</artifactId>
    <version>${geotools.version}</version>
</dependency>
<dependency>
    <!-- geojson数据存储 -->
    <groupId>org.geotools</groupId>
    <artifactId>gt-geojsondatastore</artifactId>
    <version>${geotools.version}</version>
</dependency>
```

注意：国内用户一般会配置阿里云镜像，而一些镜像配置的教程往往是错误的，往往会将`mirrorOf`参数设置为\*，这种情况下，阿里云镜像会拦截所有的 maven 请求，并向自己的镜像仓库请求数据下载，但事实上，阿里云镜像只提供对中央资源的镜像，不包含 GeoTools 的资源，因此这种情况下，maven 无法获取我们需要的 jar 包。因此，我们需要将`mirrorOf`参数值设置为**central**，同时配置 repository。

```xml
<!-- 阿里云镜像 -->
<mirror>
    <id>nexus-aliyun</id>
    <mirrorOf>central</mirrorOf>
    <name>Nexus aliyun</name>
    <url>http://maven.aliyun.com/nexus/content/groups/public</url>
</mirror>
```

以上是配置 repository 的简要原因，详细介绍可以参见[Maven 中 GeoTools 的引入 - Maven 的 repository 与 mirror](https://blog.csdn.net/Sky_Tree_Delivery/article/details/105415048)。

## GeoJSON To Shp

如果懒得看分析，可以直接跳转至[GeoJSON To Shp](#geojson2shp)查看完整代码。

正确的将 GeoJSON 转为 Shp 有以下要求：

1. 空间数据和属性数据能正常显示。
2. 若 GeoJSON 文件配置 crs 属性，需要读取 crs 以设置 shp 的坐标系，否则设置为 WGS84；
3. 为避免乱码，shp 数据应提供 cpg 格式文件；

假设 geojson 文件路径为**geojsonPath**，输出 shp 文件路径为**shpPath**。

**首先根据文件路径获得 FeatureCollection**：

```java
InputStream in = new FileInputStream(geojsonPath);
GeometryJSON gjson = new GeometryJSON();
FeatureJSON fjson = new FeatureJSON(gjson);
FeatureCollection<SimpleFeatureType, SimpleFeature> features = fjson.readFeatureCollection(in);
```

插一句：如果是 geojson 字符串呢？只需要：

```java
Reader reader = new StringReader(geojson);
GeometryJSON gjson = new GeometryJSON();
FeatureJSON fjson = new FeatureJSON(gjson);
FeatureCollection<SimpleFeatureType, SimpleFeature> features = fjson.readFeatureCollection(reader);
```

**geotools 规定转换为 shp 时，空间属性必须位于第一个，并强制命名为 the_geom，因此需要获取 geojson 的所有属性，并创建 the_geom 属性：**

```java
SimpleFeatureType schema = features.getSchema();
GeometryDescriptor geom = schema.getGeometryDescriptor();
// geojson文件所有属性
List<AttributeDescriptor> attributes = schema.getAttributeDescriptors();
// geojson文件空间类型
GeometryType geomType = null;
// 存储geojson非空间属性
List<AttributeDescriptor> attribs = new ArrayList<>();
for (AttributeDescriptor attrib : attributes) {
    AttributeType type = attrib.getType();
    if (type instanceof GeometryType) {
        geomType = (GeometryType) type;
    } else {
        attribs.add(attrib);
    }
}
if (geomType == null)
    return false;

// 使用geomType创建 the_geom type
GeometryTypeImpl gt = new GeometryTypeImpl(new NameImpl("the_geom"), geomType.getBinding(),
        geom.getCoordinateReferenceSystem() == null ? DefaultGeographicCRS.WGS84 : geom.getCoordinateReferenceSystem(), // 用户未指定则默认为wgs84
        geomType.isIdentified(), geomType.isAbstract(), geomType.getRestrictions(),
        geomType.getSuper(), geomType.getDescription());

// 根据the_geom type创建空间属性
GeometryDescriptor geomDesc = new GeometryDescriptorImpl(gt, new NameImpl("the_geom"), geom.getMinOccurs(),
        geom.getMaxOccurs(), geom.isNillable(), geom.getDefaultValue());

// the_geom 属性必须在第一个
attribs.add(0, geomDesc);
```

**接着，根据创建的 attribs 和原 schema 的信息创建能够转换为 shapefile 的 schema，并使用 try-with-resources 方式获得输出的 features 集合**：

```java
SimpleFeatureType outSchema = new SimpleFeatureTypeImpl(schema.getName(), attribs, geomDesc, schema.isAbstract(),
        schema.getRestrictions(), schema.getSuper(), schema.getDescription());
List<SimpleFeature> outFeatures = new ArrayList<>();
try (FeatureIterator<SimpleFeature> features2 = features.features()) {
    while (features2.hasNext()) {
        SimpleFeature f = features2.next();
        SimpleFeature reType = DataUtilities.reType(outSchema, f, true);

        reType.setAttribute(outSchema.getGeometryDescriptor().getName(),
                f.getAttribute(schema.getGeometryDescriptor().getName()));

        outFeatures.add(reType);
    }
}
```

**最后，根据官网给出的[csv 转换至 shp](https://docs.geotools.org/latest/userguide/tutorial/feature/csv2shp.html)的教程，我们可以写出 features to shapefile 的方法。**

<i id="geojson2shp"/>

该功能的完整代码如下：

```java
/**
 * 保存features为shp格式
 *
 * @param features 要素类
 * @param TYPE     要素类型
 * @param shpPath  shp保存路径
 * @return 是否保存成功
 */
public static boolean saveFeaturesToShp(List<SimpleFeature> features, SimpleFeatureType TYPE, String shpPath) {
    try {
        ShapefileDataStoreFactory dataStoreFactory = new ShapefileDataStoreFactory();
        File shpFile = new File(shpPath);
        Map<String, Serializable> params = new HashMap<>();
        params.put("url", shpFile.toURI().toURL());
        params.put("create spatial index", Boolean.TRUE);

        ShapefileDataStore newDataStore =
                (ShapefileDataStore) dataStoreFactory.createNewDataStore(params);
        newDataStore.setCharset(StandardCharsets.UTF_8);

        newDataStore.createSchema(TYPE);

        Transaction transaction = new DefaultTransaction("create");
        String typeName = newDataStore.getTypeNames()[0];
        SimpleFeatureSource featureSource = newDataStore.getFeatureSource(typeName);

        if (featureSource instanceof SimpleFeatureStore) {
            SimpleFeatureStore featureStore = (SimpleFeatureStore) featureSource;
            SimpleFeatureCollection collection = new ListFeatureCollection(TYPE, features);
            featureStore.setTransaction(transaction);
            try {
                featureStore.addFeatures(collection);
                FileUtil.generateCpgFile(shpPath, StandardCharsets.UTF_8);
                transaction.commit();
            } catch (Exception problem) {
                problem.printStackTrace();
                transaction.rollback();
            } finally {
                transaction.close();
            }
        } else {
            System.out.println(typeName + " does not support read/write access");
        }
    } catch (IOException e) {
        return false;
    }
    return true;
}

/**
 * GeoJson to Shp
 *
 * @param geojsonPath geojson 文件路径
 * @param shpPath     shp 文件路径
 * @return 转换是否成功
 */
public static boolean transformGeoJsonToShp(String geojsonPath, String shpPath) {
    try {
        // open geojson
        InputStream in = new FileInputStream(geojsonPath);
        GeometryJSON gjson = new GeometryJSON();
        FeatureJSON fjson = new FeatureJSON(gjson);
        FeatureCollection<SimpleFeatureType, SimpleFeature> features = fjson.readFeatureCollection(in);
        // convert schema for shapefile
        SimpleFeatureType schema = features.getSchema();
        GeometryDescriptor geom = schema.getGeometryDescriptor();
        // geojson文件属性
        List<AttributeDescriptor> attributes = schema.getAttributeDescriptors();
        // geojson文件空间类型（必须在第一个）
        GeometryType geomType = null;
        List<AttributeDescriptor> attribs = new ArrayList<>();
        for (AttributeDescriptor attrib : attributes) {
            AttributeType type = attrib.getType();
            if (type instanceof GeometryType) {
                geomType = (GeometryType) type;
            } else {
                attribs.add(attrib);
            }
        }
        if (geomType == null)
            return false;

        // 使用geomType创建gt
        GeometryTypeImpl gt = new GeometryTypeImpl(new NameImpl("the_geom"), geomType.getBinding(),
                geom.getCoordinateReferenceSystem() == null ? DefaultGeographicCRS.WGS84 : geom.getCoordinateReferenceSystem(), // 用户未指定则默认为wgs84
                geomType.isIdentified(), geomType.isAbstract(), geomType.getRestrictions(),
                geomType.getSuper(), geomType.getDescription());

        // 创建识别符
        GeometryDescriptor geomDesc = new GeometryDescriptorImpl(gt, new NameImpl("the_geom"), geom.getMinOccurs(),
                geom.getMaxOccurs(), geom.isNillable(), geom.getDefaultValue());

        // the_geom 属性必须在第一个
        attribs.add(0, geomDesc);

        SimpleFeatureType outSchema = new SimpleFeatureTypeImpl(schema.getName(), attribs, geomDesc, schema.isAbstract(),
                schema.getRestrictions(), schema.getSuper(), schema.getDescription());
        List<SimpleFeature> outFeatures = new ArrayList<>();
        try (FeatureIterator<SimpleFeature> features2 = features.features()) {
            while (features2.hasNext()) {
                SimpleFeature f = features2.next();
                SimpleFeature reType = DataUtilities.reType(outSchema, f, true);

                reType.setAttribute(outSchema.getGeometryDescriptor().getName(),
                        f.getAttribute(schema.getGeometryDescriptor().getName()));

                outFeatures.add(reType);
            }
        }
        return saveFeaturesToShp(outFeatures, outSchema, shpPath);
    } catch (IOException e) {
        e.printStackTrace();
        return false;
    }
}
```

## Shp To GeoJSON

GeoTools 关于 Shapefile 的教程很多，支持也较好，比较简单，但需要注意将 shapefile 转换为 geojson 时应该生成 crs，转换代码如下：

```java
public static boolean transformShpToGeoJson(String shpPath, String geojsonPath) {
    try {
        File file = new File(shpPath);
        FileDataStore myData = FileDataStoreFinder.getDataStore(file);
        // 设置解码方式
        ((ShapefileDataStore) myData).setCharset(StandardCharsets.UTF_8);
        SimpleFeatureSource source = myData.getFeatureSource();
        SimpleFeatureType schema = source.getSchema();
        Query query = new Query(schema.getTypeName());

        FeatureCollection<SimpleFeatureType, SimpleFeature> collection = source.getFeatures(query);
        FeatureJSON fjson = new FeatureJSON();
        File geojson = new File(geojsonPath);
        try (FeatureIterator<SimpleFeature> featureIterator = collection.features();
             StringWriter writer = new StringWriter();
             BufferedWriter buffer = new BufferedWriter(Files.newBufferedWriter(geojson.toPath(), StandardCharsets.UTF_8))) {
            writer.write("{\"type\":\"FeatureCollection\",\"crs\":");
            fjson.writeCRS(schema.getCoordinateReferenceSystem(), writer);
            writer.write(",");
            writer.write("\"features\":");
            writer.write("[");
            while (featureIterator.hasNext()) {
                SimpleFeature feature = featureIterator.next();
                fjson.writeFeature(feature, writer);
                if (featureIterator.hasNext())
                    writer.write(",");
            }
            writer.write("]");
            writer.write("}");
            buffer.write(writer.toString());
            return true;
        } catch (IOException e) {
            return false;
        }
    } catch (IOException e) {
        return false;
    }
}
```

## 后记

GeoJSON 和 Shapefile 的互相转换是 GISer 十分常见的问题，本人开发的软件 POIKit 便提供了该功能。目前支持 geojson 转为 shp，shp 转为 geojson/csv。

![格式转换](/img/in-post/geotools/POIKit-coordinate-transform.png)

## 代码

你可以在[这里](https://github.com/Civitasv/AMapPoi/blob/master/src/main/java/com/civitasv/spider/util/SpatialDataTransformUtil.java)找到我的空间格式转换工具类。
