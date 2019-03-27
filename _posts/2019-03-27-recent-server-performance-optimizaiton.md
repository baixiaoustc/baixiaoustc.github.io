---
author: baixiaoustc
comments: false
date: 2019-03-27 09:54:23+00:00
layout: post
slug: 2019-03-27-recent-server-performance-optimizaiton
title: 近期性能优化案例
categories:
- 后端技术
tags:
- golang 
- 性能
---

* content 
{:toc}

# 后端服务请求超时

业务服务A 概率性出现批量地请求消息服务超时报错：`error:Post http://message-api.in.codoon.com:4119/message_api/batch_post: net/http: request canceled (Client.Timeout exceeded while awaiting headers)`

消息服务本身没有任何错误信息可查，分析服务A代码，发现其某场景下会批量给一千个用户发消息，导致消息服务处理超时。知道地方就很好改了：


{% highlight golang %}
@@ -193,15 +193,33 @@ func DoNotify(userIds []string, source, targetId int, targetTime int64) {
        defer sp.Finish()
        ctx := context.WithValue(context.Background(), trace.CDTCtxKey, sp.Context())

+       const MAX = 100
+
        syncData := map[string]interface{}{
                "source":      source,
                "target_id":   strconv.Itoa(targetId),
                "target_time": targetTime,
        }
-       rsp, err := external.BatchSyncNotify(ctx, userIds, syncData)
-       if err != nil {
-               clog.Logger.Error("DoNotify error:%s rsp:%+v", err, rsp)
+
+       if len(userIds) == 1 {
+               rsp, err := external.SingleSyncNotify(ctx, userIds[0], syncData)
+               if err != nil {
+                       clog.Logger.Error("DoNotify error:%s rsp:%+v", err, rsp)
+               }
+       } else {
+               for i := 0; i < len(userIds); {
+                       j := i + MAX
+                       if j > len(userIds) {
+                               j = len(userIds)
+                       }
+                       us := userIds[i:j]
+                       rsp, err := external.BatchSyncNotify(ctx, us, syncData)
+                       if err != nil {
+                               clog.Logger.Error("DoNotify error:%s rsp:%+v", err, rsp)
+                       }
+                       i = j
+               }
        }
-       clog.Logger.Debug("DoNotify success user_num:%d rsp:%+v", len(userIds), rsp)
+
        return
 }
{% endhighlight %}
