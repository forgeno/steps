export const esriURL = { 
    url: "https://js.arcgis.com/4.9"
};

export const layerURL = "https://services9.arcgis.com/8ccGcFm2KpUhl0DB/arcgis/rest/services/edm_network_walkability/FeatureServer";
export const downtownLongitude = -113.4990;
export const downtownLatitude = 53.5405;

export const sidewalkColorMapRenderer = {
	type: "unique-value",  // autocasts as new UniqueValueRenderer()
	field: "AvgOverall",
	defaultSymbol: { type: "simple-fill" },  // autocasts as new SimpleFillSymbol()
	uniqueValueInfos: [

	// this is to cover rounding issues
	{
		value: 5,
		symbol: {
			type: "simple-line",  // autocasts as new SimpleLineSymbol()
			width: 4,
			color: "#00A300",
			style: "solid"
		}
	}, {
		value: 4,
		symbol: {
			type: "simple-line",  // autocasts as new SimpleLineSymbol()
			width: 4,
			color: "#00A392",
			style: "solid"
		}
	}, {
		value: 3,
		symbol: {
			type: "simple-line",  // autocasts as new SimpleLineSymbol()
			width: 4,
			color: "#FF7A00",
			style: "solid"
		}
	}, {
		value: 2,
		symbol: {
			type: "simple-line",  // autocasts as new SimpleLineSymbol()
			width: 4,
			color: '#f9a602',
			style: "solid"
		}
	}, {
		value: 1,
		symbol: {
			type: "simple-line",  // autocasts as new SimpleLineSymbol()
			width: 4,
			color: "#FF0000",
			style: "solid"
		}
	}, {
		value: 0,
		symbol: {
			type: "simple-line",  // autocasts as new SimpleLineSymbol()
			width: 4,
			color: "#D2D3D1",
			style: "solid"
		}
	}, {
		value: "",
		symbol: {
			type: "simple-line",  // autocasts as new SimpleLineSymbol()
			color: "#D2D3D1",
			width: 4,
			style: "solid"
		}
	  }],
	  highlightOptions: {
		color: [255, 241, 58],
		fillOpacity: 0.4
	  }
	};
