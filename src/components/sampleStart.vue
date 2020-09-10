<template>
  <div class="container">
    <div id="cesiumContainer" class="fullSize"></div>
  </div>
</template>

<script>
import * as Cesium from 'cesium/Cesium'
export default {
  name: 'App',
  data () {
    return {
    }
  },
  mounted () {
    this.$nextTick(() => {
      let viewer = new Cesium.Viewer('cesiumContainer', {
        terrainProvider: Cesium.createWorldTerrain()
      })
      console.log(viewer)
    })
  },
  methods: {
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
