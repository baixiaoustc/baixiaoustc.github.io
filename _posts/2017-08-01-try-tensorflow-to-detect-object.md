---
author: baixiaoustc
comments: true
date: 2017-08-01 12:12:46+00:00
layout: post
slug: 2017-08-01-try-tensorflow-to-detect-object
title: 小试tensorflow的目标识别
categories:
- 机器学习
tags:
- python tensorflow
---



* content 
{:toc}



利用tensorflow提供的目标识别的库，做图像识别简直是轻松简单酷。（google大法好）

## 先看效果吧

### 乖乖女儿


<iframe height="498" width="100%" src="http://player.youku.com/embed/XMjkzNzUzMjc0OA==" frameborder="0"> </iframe>

### 笨拙滑冰

<iframe height="498" width="100%" src="http://player.youku.com/embed/XMjkzNzUzNjExMg==" frameborder="0"> </iframe>

## 代码

### 训练模型

首先需要安装“插件”：[tensorflow/model/object_detection](https://github.com/tensorflow/models/blob/master/object_detection/g3doc/installation.md)

tensorflow官方提供了如下几种训练模型，我们选择速度最快的“ssd_mobilenet_v1_coco_11_06_2017”：

![](http://image99.renyit.com/image/Jietu20170801-185303@2x.jpg)

首先是加载计算图[graph](https://www.tensorflow.org/api_docs/python/tf/Graph)。一个TensorFlow的运算，被表示为一个数据流的图。一幅图中包含一些操作（Operation）对象，这些对象是计算节点。

    global detection_graph
    detection_graph = tf.Graph()
    with detection_graph.as_default():
        od_graph_def = tf.GraphDef()
        with tf.gfile.GFile(PATH_TO_CKPT, 'rb') as fid:
            serialized_graph = fid.read()
            od_graph_def.ParseFromString(serialized_graph)
            tf.import_graph_def(od_graph_def, name='')
            
然后是加载识别标签，标签如下图：

![](http://image99.renyit.com/image/Jietu20170801-193009@2x.jpg)

### 识别图片

需要先用numpy库把图片转位“矩阵”，把图片矩阵和标签投入session中运算，“很简单”地得到识别到的box和类别及概率，将这些信息附加到原始图片上：

	def detect_object(image_np, sess, detection_graph, category_index):
	    # Expand dimensions since the model expects images to have shape: [1, None, None, 3]
	    image_np_expanded = np.expand_dims(image_np, axis=0)
	    image_tensor = detection_graph.get_tensor_by_name('image_tensor:0')
	    # Each box represents a part of the image where a particular object was detected.
	    boxes = detection_graph.get_tensor_by_name('detection_boxes:0')
	    # Each score represent how level of confidence for each of the objects.
	    # Score is shown on the result image, together with the class label.
	    scores = detection_graph.get_tensor_by_name('detection_scores:0')
	    classes = detection_graph.get_tensor_by_name('detection_classes:0')
	    num_detections = detection_graph.get_tensor_by_name('num_detections:0')
	    # Actual detection.
	    (boxes, scores, classes, num_detections) = sess.run(
	        [boxes, scores, classes, num_detections],
	        feed_dict={image_tensor: image_np_expanded})
	    # Visualization of the results of a detection.
	    vis_util.visualize_boxes_and_labels_on_image_array(
	        image_np,
	        np.squeeze(boxes),
	        np.squeeze(classes).astype(np.int32),
	        np.squeeze(scores),
	        category_index,
	        use_normalized_coordinates=True,
	        line_thickness=8)    
	    return image_np

### 识别视频

以上只是对图片的识别，下一步需要用到moviepy库。对视频文件进行切片得到图片列表，分别对这些图片进行识别后再组装为视频：

    white_output = PATH_TO_TEST_VIDEOS_DIR + '/skate_out.mp4'
    clip = VideoFileClip(os.path.join(PATH_TO_TEST_VIDEOS_DIR, 'skate.mp4')).subclip(0,10)
    white_clip = clip.fl_image(process_image)
    white_clip.write_videofile(white_output, audio=False)


## 结束

完整代码在[https://github.com/baixiaoustc/tensorflow_objectdetection](https://github.com/baixiaoustc/tensorflow_objectdetection)

参考：

[https://github.com/tensorflow/models/blob/master/object_detection/object_detection_tutorial.ipynb](https://github.com/tensorflow/models/blob/master/object_detection/object_detection_tutorial.ipynb)

[https://github.com/priya-dwivedi/Deep-Learning/blob/master/Object_Detection_Tensorflow_API.ipynb](https://github.com/priya-dwivedi/Deep-Learning/blob/master/Object_Detection_Tensorflow_API.ipynb)
