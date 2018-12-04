---
author: baixiaoustc
comments: true
date: 2016-10-19 10:54:23+00:00
layout: post
link: http://baixiaoustc.com/wordpress/2016/10/19/%e4%bd%bf%e7%94%a8postgresql-postgis%e5%ae%9e%e7%8e%b0%e7%82%b9%e7%9a%84%e8%81%9a%e7%b1%bb%e5%b1%95%e7%a4%ba/
slug: 2016-10-19-postgresql-postgis-cluster
title: 使用postgresql-postgis实现点的聚类展示
wordpress_id: 269
categories:
- postgresql
- 路线聚集
tags:
- postgresql
---






最新版本的postgis2.3支持点的聚类操作：ST_ClusterDBSCAN和ST_ClusterKMeans，[这篇文章](https://dbaston.wordpress.com/2016/06/03/dbscan-clustering-in-postgis/)介绍了dbscan的操作。

在此基础上做一些操作：

纪录每个点的聚类

    
    CREATE TABLE mtl_crimes_cid (
      id integer,
      cid integer,
      geom geometry(Point, 2950)
    );
    
    INSERT INTO mtl_crimes_cid
    SELECT * FROM
      (SELECT id, ST_ClusterDBSCAN(geom, eps := 300, minPoints := 50)
         OVER () AS cluster_id, geom
       FROM mtl_crimes) sq
    WHERE cluster_id IS NOT NULL;
    


每个聚类选择一个代表点（质心）

    
    CREATE TABLE mtl_crimes_cen (
      cid integer,
      geom geometry(Point, 2950)
    );
    
    INSERT INTO mtl_crimes_cen
    SELECT * FROM
      (SELECT cid, ST_Centroid(ST_Union(geom)) as geom
      FROM mtl_crimes_cid
      GROUP BY cid) sq;
    
    


效果图如下，深绿色为原始点，浅绿色为聚类后的点，红色为每个簇的代表点
![postgis_cluster](http://image99.renyit.com/image/postgis_cluster.png)
