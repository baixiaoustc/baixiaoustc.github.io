---
author: baixiaoustc
comments: true
date: 2017-01-07 10:54:23+00:00
layout: post
slug: 2017-01-07-postgresql-postgis-route-to-polygon
title: 使用postgresql-postgis实现路线填充为多边形
categories:
- 后端技术
tags:
- postgresql
---





为了计算两条路线的相似度：

* 需要将“线”填充为“多边形”，加入面积属性。
* 再计算两个“多边形”的交集的面积占比。

如何将路线填充？因为路线是由点的序列构成的，计划由每个点生成一个六边形，再将一系列的六边形取并集，最终连接成路线形状的多边形。

//以每个原始点为中心的六边形

	func InsertTrackPoint(userId, routeId, polygon string) (trackId int64, err error) {
		polygon = "POLYGON((" + polygon
		polygon = polygon + "))"
		clog.Debugf("polygon %s", polygon)
	
		sql := fmt.Sprintf("INSERT INTO route_track_point(user_id,route_id,geom) "+
		"VALUES ('%s','%s',ST_PolygonFromText('%s',4326)) RETURNING id;", userId, routeId, polygon)
		clog.Infof("sql: %s", sql)
	
		err = GHotTestPg.QueryRow(sql).Scan(&trackId)
		if err != nil {
			clog.Errorf("pg error: %v", err)
			return
		}
	
		return
	}
	
//将上述六边形取并集，形成路线的填充多边形

	func CreateTrackPolygon(userId, routeId string) (err error) {
		sql := fmt.Sprintf("INSERT INTO route_track_polygon(user_id,route_id,polygon) SELECT * FROM "+
		"(SELECT '%s','%s',ST_Union(route_track_point.geom) AS geom FROM route_track_point WHERE route_id = '%s') sq;", userId, routeId, routeId)
		clog.Infof("sql: %s", sql)
	
		_, err = GHotTestPg.Exec(sql)
		if err != nil {
			clog.Errorf("pg error: %v", err)
		}
	
		return
	}	
	

//对点序列的处理	

	//以每个原始点为中心的六边形
	var offsets [6][2]float64 = [6][2]float64{
		[2]float64{0.0001, 0},
		[2]float64{0.00005, -0.0000866},
		[2]float64{-0.00005, -0.0000866},
		[2]float64{-0.0001, 0},
		[2]float64{-0.00005, 0.0000866},
		[2]float64{0.00005, 0.0000866},
	}

	var line string
	for _, point := range pointList {
		var start, polygon string
		lon := point.Longitude
		lat := point.Latitude
		line += fmt.Sprintf("%f %f,", lon, lat)
		for i, offset := range offsets {
			if i == 0 {
				start = fmt.Sprintf("%f %f,", lon+offset[0], lat+offset[1])
			}
			polygon += fmt.Sprintf("%f %f,", lon+offset[0], lat+offset[1])
		}
		polygon += start
		if polygon != "" {
			polygon = polygon[0:len(polygon) - 1]
			InsertTrackPoint(req.UserId, req.RouteId, polygon)
		}
	}
	CreateTrackPolygon(req.UserId, req.RouteId)
	
	
模拟结果如图：

![route_to_polygon](http://image99.renyit.com/image/route_to_polygon.png)
