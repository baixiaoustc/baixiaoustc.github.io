---
author: baixiaoustc
comments: false
date: 2019-05-22 09:54:23+00:00
layout: post
slug: 2019-05-22-elasticsearch-nested-struct
title: Elasticsearch的嵌套结构
categories:
- 后端技术
tags:
- elasticsearch 
- 搜索
---

* content 
{:toc}


# 嵌套结构

针对嵌套结构的基础知识，可以参考文章[嵌套对象](https://www.elastic.co/guide/cn/elasticsearch/guide/current/nested-objects.html)。

文章[Elasticsearch Nested类型深入详解](https://blog.csdn.net/laoyang360/article/details/82950393)对其场景有较好描述：

![](http://image99.renyit.com/image/2019-05-22-1.png)

# 问题

某个elasticsearch的索引有如下mapping：
	
	"Types": {
	  "type": "nested",
	  "properties": {
	    "FirstTypeName": {
	      "type": "text",
	      "fields": {
	        "Raw": {
	          "type": "keyword",
	          "ignore_above": 256
	        }
	      },
	      "analyzer": "ik_smart"
	    },
	    "Tags": {
	      "type": "text",
	      "fields": {
	        "Raw": {
	          "type": "keyword",
	          "ignore_above": 256
	        }
	      },
	      "analyzer": "ik_smart"
	    }
	  }
	}
	
描述了商品和（一级分类加二级分类）的一对多关系，两点值得说明：

* 	用`nested`结构描述一对多关系
*  特别定义了`Raw`属性，用于精准匹配

## 需要精准搜索时

在业务上需要精准匹配一级分类的时候，需要`term`查询并加强`Raw`属性：

	{
	  "query": {
	    "bool": {
	      "must": {
	        "nested": {
	          "path": "Types",
	          "query": {
	            "bool": {
	              "must": {
	                "term": {
	                  "Types.FirstTypeName.Raw": "YJT的数码智能"
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  }
	}
	
## 需要全文搜索时

在用户搜索场景，需要分类提供一定的score时，则只需要`match`查询：

	{
	  "query": {
	    "bool": {
	      "should": {
	        "multi_match": {
	          "fields": [
	            "Types.FirstTypeName^4",
	            "Types.Tags^4",
	            "Brand^30",
	            "Labels^2"
	          ],
	          "query": "华为",
	          "tie_breaker": 0.1,
	          "type": "best_fields"
	        }
	      }
	    }
	  }
	}	

## 需要判断非空时

某些场景必须要求`nested`结构非空时，使用`exists`查询：

	{
	  "query": {
	    "bool": {
	      "must": {
	        "nested": {
	          "path": "Types",
	          "query": {
	            "bool": {
	              "must": {
	                "exists": {
	                  "field": "Types.FirstTypeName"
	                }
	              }
	            }
	          }
	        }
	      }
	    }
	  }
	}