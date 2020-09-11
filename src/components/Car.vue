<template>
  <div class="container">
    <div id="cesiumContainer" class="fullSize">
      <el-button @click="deleteCar">删除车</el-button>
      <el-button @click="addCar">添加车</el-button>
    </div>
    <div id="loadingOverlay"><h1>Loading...</h1></div>
    <div id="toolbar"></div>
  </div>
</template>

<script>
import * as Cesium from 'cesium/Cesium'
import 'cesium/Widgets/widgets.css'
var viewer
var start
var totalSeconds
var stop
var position
var startPosition
var endPosition
var velocityVectorProperty
var velocityVector
var metersPerSecond
let entitiesList = []
let pMap = {}
var nodeTransformations
export default {
  name: 'App',
  data () {
    return {
      viewer: null,
      scene: null,
      clock: null,
      entity: null,
      positionProperty: ''
    }
  },
  mounted () {
    this.$nextTick(() => {
      /* 场景配置开始 */
      // 创建视图
      viewer = new Cesium.Viewer('cesiumContainer', {
        shouldAnimate: true // 模型默认是否运动
      })
      // 显示帧率
      viewer.scene.debugShowFramesPerSecond = true
      // 显示光照
      viewer.scene.globe.enableLighting = true
      // 添加Terrain 增加地形数据
      // viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
      //   url: 'https://www.supermapol.com/realspace/services/3D-stk_terrain/rest/realspace/datas/info/data/path',
      //   requestWaterMask: true, // 开启法向量
      //   requestVertexNormals: true// 开启水面特效
      // })
      // 确保viewer在所需的时间。
      start = Cesium.JulianDate.fromDate(new Date(2018, 11, 12, 15))
      totalSeconds = 10
      stop = Cesium.JulianDate.addSeconds(
        start,
        totalSeconds,
        new Cesium.JulianDate()
      )
      // 时钟的开始时间
      viewer.clock.startTime = start.clone()
      // 时钟的结束时间
      viewer.clock.stopTime = stop.clone()
      // 时钟的当前时间
      viewer.clock.currentTime = start.clone()
      // 时钟在到达时循环
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP
      viewer.timeline.zoomTo(start, stop)
      /* 场景配置结束 */
      // 通过在两个位置之间移动，为我们的车辆创建一条路径。
      position = new Cesium.SampledPositionProperty()
      for (let i = 0; i < 10; i++) {
        pMap[`position${i}`] = new Cesium.SampledPositionProperty()
      }
      const startX = -2379556.799372864
      const startY = -4665528.205030263
      const startZ = 3628013.106599678
      const endX = -2379603.7074103747
      const endY = -4665623.48990283
      const endZ = 3627860.82704567
      startPosition = new Cesium.Cartesian3(
        startX,
        startY,
        startZ
      )
      endPosition = new Cesium.Cartesian3(
        endX,
        endY,
        endZ
      )
      let positionMap = {}
      let positionList = [
        {startPosition: [-2379603.7074103747, -4665623.48990283,
          3627860.82704567],
        endPosition: [-2379556.799372864, -4665528.205030263,
          3628013.106599678]},
        {startPosition: [-2379546.799372864, -4665538.205030263,
          3628013.106599678],
        endPosition: [-2379556.799372864, -4665528.205030263,
          3628013.106599678]},
        {startPosition: [-2379593.7074103747, -4665643.48990283,
          3627860.82704567],
        endPosition: [-2379556.799372864, -4665528.205030263,
          3628013.106599678]},
        {startPosition: [-2379553.7074103747, -4665623.48990283,
          3627860.82704567],
        endPosition: [-2379556.799372864, -4665528.205030263,
          3628013.106599678]},
        {startPosition: [-2379553.7074103747, -4665623.48990283,
          3627860.82704567],
        endPosition: [-2379536.799372864, -4665598.205030263,
          3628013.106599678]},
        {startPosition: [-2379653.7074103747, -4665623.48990283,
          3627860.82704567],
        endPosition: [-2379536.799372864, -4665598.205030263,
          3628013.106599678]},
        {startPosition: [-2379553.7074103747, -4665650.48990283,
          3627860.82704567],
        endPosition: [-2379536.799372864, -4665598.205030263,
          3628013.106599678]},
        {startPosition: [-2379553.7074103747, -4665623.48990283,
          3627860.82704567],
        endPosition: [-2379526.799372864, -4665518.205030263,
          3628013.106599678]},
        {startPosition: [-2379523.7074103747, -4665603.48990283,
          3627860.82704567],
        endPosition: [-2379516.799372864, -4665598.205030263,
          3628013.106599678]},
        {startPosition: [-2379523.7074103747, -4665623.48990283,
          3627860.82704567],
        endPosition: [-2379516.799372864, -4665598.205030263,
          3628013.106599678]}
      ]
      positionList.forEach((item, index) => {
        positionMap[`startPosition${index}`] = new Cesium.Cartesian3(
          item.startPosition[0],
          item.startPosition[1],
          item.startPosition[2]
        )
        positionMap[`endPosition${index}`] = new Cesium.Cartesian3(
          item.endPosition[0],
          item.endPosition[1],
          item.endPosition[2]
        )
      })
      console.log(positionMap)
      // 速度向量属性将给出实体在任何给定时间的速度和方向。
      velocityVectorProperty = new Cesium.VelocityVectorProperty(
        position,
        false
      )
      velocityVector = new Cesium.Cartesian3()
      // 将车轮随时间的旋转存储在SampledProperty中。
      var wheelAngleProperty = new Cesium.SampledProperty(Number)
      var wheelAngle = 0
      var numberOfSamples = 100
      for (var m = 0; m <= numberOfSamples; ++m) {
        var factor = m / numberOfSamples
        var time = Cesium.JulianDate.addSeconds(
          start,
          factor * totalSeconds,
          new Cesium.JulianDate()
        )
        // Lerp使用非线性系数使车辆加速。
        var locationFactor = Math.pow(factor, 2)
        var location = Cesium.Cartesian3.lerp(
          startPosition,
          endPosition,
          locationFactor,
          new Cesium.Cartesian3()
        )
        let locationMap = {}
        for (let k = 0; k < 10; k++) {
          locationMap[`location${k}`] = Cesium.Cartesian3.lerp(
            positionMap[`startPosition${k}`],
            positionMap[`endPosition${k}`],
            locationFactor,
            new Cesium.Cartesian3()
          )
        }
        position.addSample(time, location)
        for (let q = 0; q < 10; q++) {
          pMap[`position${q}`].addSample(time, locationMap[`location${q}`])
        }
        // 根据车辆在每个时间步的移动速度旋转车轮。
        velocityVectorProperty.getValue(time, velocityVector)
        metersPerSecond = Cesium.Cartesian3.magnitude(velocityVector)
        var wheelRadius = 0.52 // in meters.
        var circumference = Math.PI * wheelRadius * 2
        var rotationsPerSecond = metersPerSecond / circumference

        wheelAngle +=
          ((Math.PI * 2 * totalSeconds) / numberOfSamples) *
          rotationsPerSecond
        wheelAngleProperty.addSample(time, wheelAngle)
      }
      var rotationProperty = new Cesium.CallbackProperty(function (
        time,
        result
      ) {
        return Cesium.Quaternion.fromAxisAngle(
          Cesium.Cartesian3.UNIT_X,
          wheelAngleProperty.getValue(time),
          result
        )
      },
      false)

      var wheelTransformation = new Cesium.NodeTransformationProperty({
        rotation: rotationProperty
      })

      nodeTransformations = {
        Wheels: wheelTransformation,
        Wheels_mid: wheelTransformation,
        Wheels_rear: wheelTransformation
      }

      // 添加车辆模型
      var vehicleEntity = viewer.entities.add({
        position: position,
        orientation: new Cesium.VelocityOrientationProperty(position),
        // 自动将车辆方向设置为其所面对的方向。
        model: {
          uri: '../static/Apps/SampleData/models/GroundVehicle/GroundVehicle.glb',
          runAnimations: false,
          nodeTransformations: nodeTransformations
        },
        label: {
          text: new Cesium.CallbackProperty(this.updateSpeedLabel, false),
          font: '20px sans-serif',
          showBackground: true,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0.0,
            100.0
          ),
          eyeOffset: new Cesium.Cartesian3(0, 3.5, 0)
        }
      })
      for (let c = 0; c < 10; c++) {
        // entitiesMap[`entity${c}`] 可以设置变量名，但感觉麻烦些
        viewer.entities.add({
          id: `id${c}`, // 为其设置id，通过id删除实体
          position: pMap[`position${c}`],
          orientation: new Cesium.VelocityOrientationProperty(pMap[`position${c}`]),
          // 自动将车辆方向设置为其所面对的方向。
          model: {
            uri: '../static/Apps/SampleData/models/GroundVehicle/GroundVehicle.glb',
            runAnimations: false,
            nodeTransformations: nodeTransformations
          },
          label: {
            text: new Cesium.CallbackProperty(this.updateSpeedLabel, false),
            font: '20px sans-serif',
            showBackground: true,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0.0,
              100.0
            ),
            eyeOffset: new Cesium.Cartesian3(0, 3.5, 0)
          }
        })
        // 同步更新实体id数组，用于删除与增加实体
        entitiesList.push(`id${c}`)
      }
      // 此处为跟车视角
      viewer.trackedEntity = vehicleEntity
      vehicleEntity.viewFrom = new Cesium.Cartesian3(-10.0, 7.0, 4.0)
      // 设置经纬度 位置:destination(x,y,z)
      // orientation heading/pitch/roll或direction/up。
      // 航向角、俯仰角和横滚角以弧度定义。航向角是从正角度向东增加的局部北向旋转。
      // 俯仰角是指从局部的东北平面开始的旋转。正俯仰角在平面上方。负俯仰角在平面以下。
      // 横滚角是围绕局部东轴应用的第一个旋转
      viewer.camera.setView({
        destination: new Cesium.Cartesian3(
          -2379556.799372864,
          -4665528.205030263,
          3628113.106599678
        ),
        orientation: new Cesium.HeadingPitchRoll(
          4.2892217081808806,
          -0.4799070147502502,
          6.279789177843313
        ),
        endTransform: Cesium.Matrix4.IDENTITY
      })
      console.log(vehicleEntity)
    })
  },
  methods: {
    deleteCar () {
      console.log(entitiesList[entitiesList.length - 1])
      if (entitiesList.length > 0) {
        viewer.entities.remove(viewer.entities.getById(entitiesList[entitiesList.length - 1]))
        entitiesList.splice(entitiesList.length - 1, 1)
      }
    },
    addCar () {
      viewer.entities.add({
        id: `id${entitiesList.length}`, // 为其设置id，通过id删除实体
        position: pMap[`position${entitiesList.length}`],
        orientation: new Cesium.VelocityOrientationProperty(position),
        // 自动将车辆方向设置为其所面对的方向。
        model: {
          uri: '../static/Apps/SampleData/models/GroundVehicle/GroundVehicle.glb',
          runAnimations: false,
          nodeTransformations: nodeTransformations
        },
        label: {
          text: new Cesium.CallbackProperty(this.updateSpeedLabel, false),
          font: '20px sans-serif',
          showBackground: true,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0.0,
            100.0
          ),
          eyeOffset: new Cesium.Cartesian3(0, 3.5, 0)
        }
      })
      entitiesList.push(`id${entitiesList.length}`)
    },
    updateSpeedLabel (time, result) {
      velocityVectorProperty.getValue(time, velocityVector)
      metersPerSecond = Cesium.Cartesian3.magnitude(velocityVector)
      var kmPerHour = Math.round(metersPerSecond * 3.6)
      return kmPerHour + ' km/hr'
    }
  }
}
</script>
<style>
  html,
  body {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
  }
  #app,#cesiumContainer {
    font-family: "Avenir", Helvetica, Arial, sans-serif;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
