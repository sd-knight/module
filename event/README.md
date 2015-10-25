### 使用说明

#### EventModel
可以新建一个事件模型对象，或者对现有的对象扩展为事件模型对象
```
var eventModle = new EventModel;
    EventModel(object);
```

#### API
on 添加事件
```
eventModel.on('eventName', function callback(){
  //do something;
});
//可使用对象书写方式
eventModel.on({
  eventName: function(){
    //do somethind;
  },
  eventName: function(){
    //do something;
  }
})
```

one 添加一次性事件，回调只执行一次
```
eventModel.one('eventName', callback);
```

off 移除事件
```
eventModel.off('eventName'); //如果不传入callback name，即删除所有该事件所有回调
eventModel.off('eventName', callback);
```

emit 触发事件
```
eventModel.emit('eventName'); //触发事件
eventModel.emit('eventName', [data]);  //可传入参数，作为回调函数的参数
```
