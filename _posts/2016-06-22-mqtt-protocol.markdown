---
author: baixiaoustc
comments: true
date: 2016-06-22 04:50:58+00:00
layout: post
slug: 2016-06-22-mqtt-protocol
title: 转：MQTT协议
wordpress_id: 73
categories:
- 后端技术
tags:
- mqtt
---

转自[http://www.cnblogs.com/caca/p/mqtt.html](http://www.cnblogs.com/caca/p/mqtt.html)


### MQTT - MQ Telemetry Transport


轻量级的 machine-to-machine 通信协议。
publish/subscribe模式。
基于TCP/IP。
支持QoS。
适合于低带宽、不可靠连接、嵌入式设备、CPU内存资源紧张。
是一种比较不错的Android消息推送方案。
FacebookMessenger采用了MQTT。
MQTT有可能成为物联网的重要协议。


### 消息体


![](http://images.cnitblog.com/i/1408/201403/151002110437924.png)


### MessageType


![](http://images.cnitblog.com/i/1408/201403/151002431369685.png)

CONNECT
TCP连接建立完毕后，Client向Server发出一个Request。
如果一段时间内接收不到Server的Response，则关闭socket，重新建立一个session连接。
如果一个ClientID已经与服务器连接，则持有同样ClientID的旧有连接必须由服务器关闭后，新建立才能建立。

CONNACK
Server发出Response响应。
0x00 Connection Accepted
0x01 Connection Refused: unacceptable protocol version
0x02 Connection Refused: identifier rejected
0x03 Connection Refused: server unavailable
0x04 Connection Refused: bad user name or password
0x05 Connection Refused: not authorized

PUBLISH 发布消息
Client/Servier均可以进行PUBLISH。
publish message 应该包含一个TopicName(Subject/Channel)，即订阅关键词。

关于Topic通配符
/：用来表示层次，比如a/b，a/b/c。
#：表示匹配>=0个层次，比如a/#就匹配a/，a/b，a/b/c。
单独的一个#表示匹配所有。
不允许 a#和a/#/c。
+：表示匹配一个层次，例如a/+匹配a/b，a/c，不匹配a/b/c。
单独的一个+是允许的，a+不允许，a/+/b不允许

PUBACK 发布消息后的确认
QoS=1时，Server向Client发布该确认（Client收到确认后删除），订阅者向Server发布确认。

PUBREC / PUBREL / PUBCOMP
QoS=2时
1. Server->Client发布PUBREC（已收到）；
2. Client->Server发布PUBREL（已释放）；
3. Server->Client发布PUBCOMP（已完成），Client删除msg；
订阅者也会向Server发布类似过程确认。

PINGREQ / PINGRES 心跳
Client有责任发送KeepAliveTime时长告诉给Server。在一个时长内，发送PINGREQ，Server发送PINGRES确认。
Server在1.5个时长内未收到PINGREQ，就断开连接。
Client在1个时长内未收到PINGRES，断开连接。
一般来说，时长设置为几个分钟。最大18hours，0表示一直未断开。


### QoS


![](http://images.cnitblog.com/i/1408/201403/151003150901190.png)

QoS=0：最多一次，有可能重复或丢失。

QoS=1：至少一次，有可能重复。
Client[Qos=1,DUP=0/*重复次数*/,MessageId=x] --->PUBLISH--> Server收到后，存储Message，发布，删除，向Client回发PUBACK
Client收到PUBACK后，删除Message；如果未收到PUBACK，设置DUP++，重新发送，Server端重新发布，所以有可能重复发送消息。

QoS=2：只有一次，确保消息只到达一次（用于比较严格的计费系统）。


### Clean Session


如果为false(flag=0)，Client断开连接后，Server应该保存Client的订阅信息。
如果为true(flag=1)，表示Server应该立刻丢弃任何会话状态信息。

Refs
http://public.dhe.ibm.com/software/dw/webservices/ws-mqtt/mqtt-v3r1.html
