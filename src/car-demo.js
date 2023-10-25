import {Scene,
    PerspectiveCamera,
    WebGLRenderer,
    AxesHelper,
    GridHelper,
    AmbientLight,
    PlaneGeometry,
    MeshPhysicalMaterial,
    DoubleSide,
    Mesh,
    SpotLight,
    CylinderGeometry} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import Lamborghini from './public/Lamborghini.glb'
import GUI from 'lil-gui'; 
const TWEEN = require('@tweenjs/tween.js');

let scene,renderer,camera,orbitControls,doors = [];

let bodyMaterial = new MeshPhysicalMaterial({
    color:'red',
    metalness:1,
    roughness:0.5,
    clearcoat:1.0,//漆面
    clearcoatRoughness:0.03,
    sheen:0.5//用于表示布料和织物材料
})

let glassMaterial = new MeshPhysicalMaterial({
    color:'#793e3e',
    metalness:0.25,
    roughness:0,
    transmission:1
})

//初始化场景
function initScene(){
    scene = new Scene()
}

//初始化相机
function initCamera(){
    camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(4.25, 1.4, -4.5);
    camera.updateProjectionMatrix();  // 更新投影矩阵
}

//初始化渲染器
function initRenderer(){
    renderer = new WebGLRenderer({
        antialias:true,//抗锯齿效果
    })
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.shadowMap.enabled = true;  // 启用阴影
    document.body.appendChild(renderer.domElement)
}

//循环渲染
function render(time){
    renderer.render(scene, camera)
    requestAnimationFrame(render)
    TWEEN.update(time)
    orbitControls.update()
}

//初始化坐标轴
function initAxesHelper(){
    const axesHelper = new AxesHelper()
    scene.add(axesHelper)
}

//初始化环境光
function initAmbientLight(){
    const light = new AmbientLight('#fff',0.2)
    scene.add(light)
}

//初始化轨道控制器
function initOrbitControls(){
    orbitControls = new OrbitControls(camera,renderer.domElement)
    orbitControls.enableDamping = true

    orbitControls.maxDistance = 9
    orbitControls.minDistance = 1
    
    orbitControls.minPolarAngle = 0
    orbitControls.maxPolarAngle = 80 / 360 * 2 * Math.PI
}

//初始化地面
function initGridHelper(){
    const grid = new GridHelper(20,40,'red',0xffffff);
    grid.material.opacity = 0.2
    grid.material.transparent=true
    scene.add(grid)
}

//加载模型
function loadCarModel(){
    new GLTFLoader().load(Lamborghini,function(gltf){
        const carModel = gltf.scene
        carModel.rotation.y = Math.PI
        carModel.traverse((obj)=>{
            const {name} = obj
            switch(name){
                case 'Object_103':
                case 'Object_64':
                case 'Object_77':
                    obj.material = bodyMaterial;
                    break;
                case 'Object_90'://玻璃
                    obj.material = glassMaterial
                    break;
                case 'Empty001_16':
                case 'Empty002_20'://门
                    doors.push(obj)
                    break;
                default:
                    break;     
            }
            obj.castShadow = true;
        })
        scene.add(carModel)
    })
}


// 
function initFloor(){
    const geometry = new PlaneGeometry(20,20)
    const material = new MeshPhysicalMaterial({
        side: DoubleSide,//双面绘制
        color:0xffffff,
        metalness: 0,//金属度
        roughness: 0//粗糙度，越小越光滑
    })
    const mesh = new Mesh(geometry,material)
    mesh.rotation.x = Math.PI/2
    mesh.receiveShadow = true
    scene.add(mesh)
}

//初始化聚光灯
function initSpotLight(){
    const spotlight = new SpotLight('#fff',200);

    spotlight.angle = Math.PI / 10; //散射角度，越小越集中，不会分散
    spotlight.penumbra = 0.2;  // 聚光锥的半影衰减百分比
    spotlight.decay = 2; // 纵向：沿着光照距离的衰减量。
    spotlight.distance = 30;
    spotlight.shadow.radius = 10;
    // 阴影映射宽度，阴影映射高度
    spotlight.shadow.mapSize.set(4096, 4096);

    spotlight.position.set(-5, 10, 1);
    // 光照射的方向
    spotlight.target.position.set(0, 0, 0);
    spotlight.castShadow = true;
    // spotlight.map = bigTexture
    scene.add(spotlight);
}


function initCylinder(){
    // CylinderGeometry的构造参数分别是顶部半径，底部半径，高度，以及分段数量
    const cylinder = new CylinderGeometry(10,10,20,20)
    const material = new MeshPhysicalMaterial({
        color: 0x6c6c6c,
        side: DoubleSide    
    })
    const cylinderMesh = new Mesh(cylinder,material)
    scene.add(cylinderMesh)
}

//初始化面板
function initGUI(){
    const gui = new GUI()
    //obj相当于是给这个面板一个初始值
    let obj = {
        bodyColor:'#6e2121',
        glassMaterial:'#aaa',
        carOpen,
        carClose,
        carIn,
        carOut
    }
    gui.addColor(obj,"bodyColor").name('车身颜色').onChange(value=>{
        bodyMaterial.color.set(value)
    })

    gui.addColor(obj,"glassMaterial").name('玻璃颜色').onChange(value=>{
        bodyMaterial.color.set(value)
    })

    //直接`.add`相当于添加事件
    gui.add(obj,"carOpen").name('打开车门')
    gui.add(obj,"carClose").name('关闭车门')
    gui.add(obj,"carIn").name('车内视角')
    gui.add(obj,"carOut").name('车外视角')
}

function carOpen(){
    for(let index = 0;index<doors.length;index++){
        const element = doors[index]
        setAnimationDoor( {x:0}, {x:Math.PI/3}, element)
    }
}

function carClose(){
    for(let index = 0;index<doors.length;index++){
        const element = doors[index]
        setAnimationDoor( {x:Math.PI/3}, {x:0}, element)
    }
}

function carIn() {    
    setAnimationCamera(
        { 
            cx: camera.position.x, cy: camera.position.y, cz: camera.position.z, 
            ox: orbitControls.target.x, oy: orbitControls.target.y, oz: orbitControls.target.z 
        },
        { cx: -0.27, cy: 0.83, cz: 0.60, ox: 0, oy: 0.5, oz: -3 });
}

function carOut() {
    setAnimationCamera({ cx: -0.27, cy: 0.83, cz: 0.6, ox: 0, oy: 0.5, oz: -3 }, { cx: 4.25, cy: 1.4, cz: -4.5, ox: 0, oy: 0.5, oz: 0 });
}

function setAnimationDoor(start, end, mesh) {
    const tween = new TWEEN.Tween(start).to(end, 1000).easing(TWEEN.Easing.Quadratic.Out)
    tween.onUpdate((that) => {
        mesh.rotation.x = that.x
    })
    tween.start()
}


function setAnimationCamera(start,end,mesh){
    const tween = new TWEEN.Tween(start).to(end,3000).easing(TWEEN.Easing.Quadratic.Out)
    tween.onUpdate((that)=>{
        camera.position.set(that.cx,that.cy,that.cz)
        orbitControls.target.set(that.ox,that.oy,that.oz)
    })
    tween.start()
}

//主函数
function init(){
    initScene()
    initCamera()
    initRenderer()
    initAxesHelper()
    initOrbitControls()

    loadCarModel()
    initAmbientLight()
    initFloor()
    initCylinder()
    initSpotLight()
    initGUI()
}



init()
render()


function resizeEvent(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    // renderer
    renderer.setSize(window.innerWidth, window.innerHeight)
}
window.addEventListener('resize', resizeEvent)
