<template>
  <div class="container">
    <div id="cesiumContainer" class="fullSize"></div>
    <div id="loadingOverlay"><h1>Loading...</h1></div>
    <div id="toolbar"></div>
  </div>
</template>

<script>
import * as Cesium from 'cesium/Cesium'
import 'cesium/Widgets/widgets.css'
var viewer
var scene
var clock
var entity
var positionProperty
var dataSourcePromise
var tileset
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
      viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: Cesium.createWorldTerrain()
      })
      scene = viewer.scene
      clock = viewer.clock
      dataSourcePromise = Cesium.CzmlDataSource.load(
        '../static/Apps/SampleData/ClampToGround.czml'
      )
      viewer.dataSources.add(dataSourcePromise).then((dataSource) => {
        entity = dataSource.entities.getById('CesiumMilkTruck')
        positionProperty = entity.position
        this.start()
      })
      tileset = scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: Cesium.IonResource.fromAssetId(2)
        })
      )

      viewer.camera.setView({
        destination: new Cesium.Cartesian3(
          1216403.8845586285,
          -4736357.493351395,
          4081299.715698949
        ),
        orientation: new Cesium.HeadingPitchRoll(
          4.2892217081808806,
          -0.4799070147502502,
          6.279789177843313
        ),
        endTransform: Cesium.Matrix4.IDENTITY
      })

      if (scene.clampToHeightSupported) {
        tileset.initialTilesLoaded.addEventListener(() => {
          this.start()
        })
      } else {
        window.alert('This browser does not support clampToHeight.')
      }
      // this.start()
    })
  },
  methods: {
    start () {
      console.log('qqqq')
      clock.shouldAnimate = true
      var objectsToExclude = [entity]
      scene.postRender.addEventListener(() => {
        var position = positionProperty.getValue(clock.currentTime)
        entity.position = scene.clampToHeight(position, objectsToExclude)
      })
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
