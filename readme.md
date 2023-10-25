# Three.js Demo

## 3d车辆展示demo

### 准备工作
依赖项:`Three`,`lil-gui`,`TWEEN`.
环境构建工具`parcel`:
```
    $ npm install parcel
    $ npm install --save--dev three
    $ npm install --save--dev lil-gui
    $ npm install --save--dev @tweenjs/tween.js
```

3d模型的加载，需要配置loader:新建一个`.parcelrc`文件.
加入以下内容
```
{
 "extends": "@parcel/config-default",
 "transformers": {
 "*.{gltf,glb,png,jpg,obj,exr}": [
 "@parcel/transformer-raw"
 ]
 }
}
```
### 基础要素的构建
新建场景，渲染器，相机，环境光，轨道控制器,聚光灯，展厅，车模型的导入。
关键函数说明:
```
    //在three.js中场景需要通过循环渲染。需要通过调用requestAnimationFrame来实现.
    function render(){
        renderer.render(scene, camera)
        requestAnimationFrame(render)
        TWEEN.update(time)
        orbitControls.update()
    }
```


# Three.js-Demo
