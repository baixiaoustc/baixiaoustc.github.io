---
author: baixiaoustc
comments: true
date: 2017-01-07 16:54:23+00:00
layout: post
slug: 2016-01-07-postgresql-postgis-polygon-intersections
title: 使用postgresql-postgis实现多边形取交集
categories:
- postgresql
- 路线聚集
tags:
- postgresql
---



交集表结构为

>postgres=# \d route\_intersects\_polygon
>>		Table "public.route\_intersects\_polygon"
 Column  |   Type   |                               Modifiers                               
---------+----------+-----------------------------------------------------------------------
 id      | bigint   | not null default nextval('route\_intersects\_polygon_id_seq'::regclass)
 polygon | geometry | 
Indexes:
    "route\_intersects\_polygon_pkey" PRIMARY KEY, btree (id)


代码为

	INSERT INTO route_intersects_polygon(polygon) SELECT * FROM
	(SELECT ST_Intersection(a.polygon, b.polygon) As intersect_ab
	FROM route_track_polygon a, route_challenge_polygon b
	WHERE ST_Intersects(a.polygon, b.polygon)) sq;
	
	
结果为：

![polygon_intersection](http://oiz85bhef.bkt.clouddn.com/image/polygon_intersection.png)