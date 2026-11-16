document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('globeViz');
  if (!container || typeof Cesium === 'undefined') return;

  const viewer = new Cesium.Viewer('globeViz', {
    navigationInstructionsInitiallyVisible: false,
    animation: false,
    timeline: false,
    skyBox: false,
    sceneModePicker: false,
    baseLayerPicker: false,
    geocoder: false,
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(
      Cesium.TileMapServiceImageryProvider.fromUrl(Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'))
    ),
    terrainProvider: new Cesium.EllipsoidTerrainProvider()
  });

  const satellite = new Cesium.UrlTemplateImageryProvider({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maximumLevel: 14,
    credit: new Cesium.Credit('Powered by Esri. Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community', true)
  });
  
  satellite.errorEvent.addEventListener(() => {});
  viewer.imageryLayers.addImageryProvider(satellite);

  viewer.scene.backgroundColor = Cesium.Color.BLACK;
  viewer.scene.globe.baseColor = Cesium.Color.WHITE;

  const destinos = [
    { lat: 52.3676, lng: 4.9041,  name: 'Amsterdam',         slug: 'amsterdam' },
    { lat: 37.9838, lng: 23.7275, name: 'Athens',            slug: 'atenas' },
    { lat: 41.3851, lng: 2.1734,  name: 'Barcelona',         slug: 'barcelona' },
    { lat: 52.5200, lng: 13.4050, name: 'Berlin',            slug: 'berlin' },
    { lat: 38.7223, lng: -9.1393, name: 'Lisbon',            slug: 'lisboa' },
    { lat: 51.5074, lng: -0.1278, name: 'London',            slug: 'londres' },
    { lat: 48.8566, lng: 2.3522,  name: 'Paris',             slug: 'paris' },
    { lat: 50.0755, lng: 14.4378, name: 'Prague',            slug: 'praga' },
    { lat: 41.9028, lng: 12.4964, name: 'Rome',              slug: 'roma' },
    { lat: 59.9311, lng: 30.3609, name: 'Saint Petersburg',  slug: 'san-petersburgo' },
    { lat: 13.7563, lng: 100.5018, name: 'Bangkok',          slug: 'bangkok' },
    { lat: 25.2048, lng: 55.2708,  name: 'Dubai',            slug: 'dubai' },
    { lat: 41.0082, lng: 28.9784,  name: 'Istanbul',         slug: 'estambul' },
    { lat: 35.0116, lng: 135.7681, name: 'Kyoto',            slug: 'kioto' },
    { lat: -33.9249, lng: 18.4241, name: 'Cape Town',        slug: 'ciudad-del-cabo' },
    { lat: 30.0444,  lng: 31.2357, name: 'Cairo',            slug: 'el-cairo' },
    { lat: 31.6295,  lng: -7.9811, name: 'Marrakech',        slug: 'marrakech' },
    { lat: 40.7128, lng: -74.0060, name: 'New York',         slug: 'nueva-york' },
    { lat: -34.6037, lng: -58.3816, name: 'Buenos Aires',     slug: 'buenos-aires' },
    { lat: -22.9068, lng: -43.1729, name: 'Rio de Janeiro',   slug: 'rio-de-janeiro' }
  ];

  const icono = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">' +
    '<path fill="#EE3B42" d="M28 1C16 1 6.5 10.5 6.5 22.5 6.5 37 21 48.5 26.3 54.3a2.3 2.3 0 0 0 3.4 0C35 48.5 49.5 37 49.5 22.5 49.5 10.5 40 1 28 1Z"/>' +
    '<circle fill="#FFE1D8" cx="28" cy="22" r="11"/></svg>'
  );
  const destinationBase = window.travelAgencyGlobe?.destinationBase || '/destinations/';
  const sizeByDistance = new Cesium.NearFarScalar(1.5e6, 1, 4.5e6, 0.5);
  
  const labelFade = new Cesium.NearFarScalar(4e6, 1, 5e6, 0);

  destinos.forEach(dest => {
    const entity = viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(dest.lng, dest.lat, 1000),
      billboard: {
        image: icono,
        width: 28,
        height: 28,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        scaleByDistance: sizeByDistance
      },
      label: {
        text: dest.name,
        font: '20px sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -30),
        pixelOffsetScaleByDistance: sizeByDistance,
        scaleByDistance: sizeByDistance,
        translucencyByDistance: labelFade
      },
      name: dest.name,
      slug: dest.slug
    });

    entity.description = `<a href="${destinationBase}${encodeURIComponent(dest.slug)}/" target="_self"><strong>Ver destino</strong></a>`;
  });

  // Keep the camera between the sharpest imagery level and a view of the whole planet.
  const controller = viewer.scene.screenSpaceCameraController;
  controller.minimumZoomDistance = 5000;
  controller.maximumZoomDistance = 25000000;

  const startView = { destination: Cesium.Cartesian3.fromDegrees(-5.9845, 37.3891, 3000000) };
  viewer.homeButton.viewModel.command.beforeExecute.addEventListener(event => {
    event.cancel = true;
    viewer.camera.setView(startView);
  });

  // flyTo leaves the camera with a NaN position on the first wheel zoom in Cesium 1.128.
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(-5.9845, 37.3891, 3000000)
  });

  viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
    const pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.slug) {
      window.location.href = `${destinationBase}${encodeURIComponent(pickedObject.id.slug)}/`;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
});
