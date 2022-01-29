---
author: baixiaoustc
comments: true
date: 2016-12-30 09:54:23+00:00
layout: post
slug: 2016-12-30-golang-xlsx-panic
title: golang使用xlsx不当会引发panic
categories:
- 后端技术
tags:
- golang
---

* content 
{:toc}



引用https://github.com/tealeg/xlsx，使用不当会引发panic。当xlsx表格含有空行时，xlsx返回的行数和真实有效行数会造成困扰，如下图，23073之后的行都为无效数据，如果尝试获取cell数据会panic。

![bad_xlsx](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/bad_xlsx.png)

	package main
	
	import (
		"third/xlsx"
		"fmt"
	)
	
	
	func main() {
		xlFile, err := xlsx.OpenFile("/Users/baixiao/Go/src/test/12.29-女性.xlsx")
		if err != nil {
			fmt.Printf("OpenFile error: %v", err)
			return
		}
	
		fmt.Println(len(xlFile.Sheets[0].Rows))
		for _, row := range xlFile.Sheets[0].Rows {
			var userId string
			userId, err = row.Cells[0].String()
			if err != nil {
				fmt.Printf("cell %s string error: %v", userId, err)
				continue
			}
			//fmt.Println(i, userId)
		}
	}
	
![xlsx_panic](https://baixiao-1309470472.cos.ap-chengdu.myqcloud.com/image/xlsx_panic1.png)	

解决方法为获取cell数据前判断长度
