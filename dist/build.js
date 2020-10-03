try {
    var d3 = require('d3');
}
catch (err) { }
var rtVis = (function () {
    function rtVis(x) {
        this._config = x;
        this.activeArea = x['activeArea'];
        this.activeTime = x['activeTime'];
        this.runDate = x['runDate'];
        this.activeSource = Object.keys(x['rtData'])[0];
        this.activeMapData = 'Expected change in daily cases';
        this.downloadUrl = x['downloadUrl'];
        this.ts_color_ref = x['ts_color_ref'];
        var available_rt_data = Object.values(x['rtData'][this.activeSource]).filter(function (x) { return x !== null; });
        if (!available_rt_data[0].then) {
            this._requiredData = Promise.all([{ 'geoData': x['geoData'],
                    'rtData': x['rtData'] }
            ]);
        }
        else {
            this._requiredData = this.recursiveObjectPromiseAll([{ 'geoData': x['geoData'],
                    'rtData': x['rtData']
                }]);
        }
        this._subregional_ref = x['subregional_ref'];
        this.fullWidth = x['fullWidth'];
    }
    rtVis.prototype.summaryWidget = function (root_element) {
        this.setupPage(root_element);
        this.createMap();
    };
    rtVis.prototype.setupFlex = function (root_element) {
        var onlyUnique = this.onlyUnique;
        var containsAll = function (arr, target) { return target.every(function (v) { return arr.includes(v); }); };
        var i = new interact(this._config);
        var eventHandlers = {
            'timeBrush': i.timeBrush.bind(this),
            'dropdownClick': i.dropdownClick.bind(this),
            'sourceSelectClick': i.sourceSelectClick.bind(this)
        };
        var _config = this._config;
        var country = this.activeArea;
        var time = this.activeTime;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        var subRegion = this.subRegion;
        var fullWidth = this.fullWidth;
        var getDateLims = this.getDateLims;
        var setActiveTime = function (lims) { this.activeTime = lims; }.bind(this);
        var downloadUrl = this.downloadUrl;
        var ts_color_ref = this.ts_color_ref;
        this._requiredData.then(function (data) {
            data = data[0];
            var date_lims = null;
            try {
                data['rtData']['Cases']['summaryData'] = data['rtData']['Cases']['summaryData'].map(subRegion);
                data['rtData']['Cases']['rtData'] = data['rtData']['Cases']['rtData'].map(subRegion);
                data['rtData']['Cases']['casesInfectionData'] = data['rtData']['Cases']['casesInfectionData'].map(subRegion);
                data['rtData']['Cases']['casesReportData'] = data['rtData']['Cases']['casesReportData'].map(subRegion);
                data['rtData']['Deaths']['summaryData'] = data['rtData']['Deaths']['summaryData'].map(subRegion);
                data['rtData']['Deaths']['rtData'] = data['rtData']['Deaths']['rtData'].map(subRegion);
                data['rtData']['Deaths']['casesInfectionData'] = data['rtData']['Deaths']['casesInfectionData'].map(subRegion);
                data['rtData']['Deaths']['casesReportData'] = data['rtData']['Deaths']['casesReportData'].map(subRegion);
            }
            catch (_a) { }
            var s = new setup(_config);
            var t = new ts(_config);
            var ts_null = data['rtData'][activeSource]['rtData'] === null && data['rtData'][activeSource]['casesInfectionData'] === null && data['rtData'][activeSource]['casesReportData'] === null;
            if (!ts_null) {
                s.setupDropDown(root_element);
            }
            if (downloadUrl !== null) {
                s.setupDownload(root_element, downloadUrl, fullWidth);
            }
            if (data['geoData'] !== null && data['rtData'][activeSource]['summaryData'] !== null) {
                s.setupMap(root_element);
            }
            try {
                var areaNames = data['rtData'][activeSource]['rtData'].map(function (d) { return (d.region); }).filter(onlyUnique).sort();
            }
            catch (_b) { }
            try {
                var areaNames = data['rtData'][activeSource]['casesInfectionData'].map(function (d) { return (d.region); }).filter(onlyUnique).sort();
            }
            catch (_c) { }
            try {
                var areaNames = data['rtData'][activeSource]['casesReportData'].map(function (d) { return (d.region); }).filter(onlyUnique).sort();
            }
            catch (_d) { }
            if (!ts_null) {
                $('#dropdown-container').append('.js-example-basic-single').select2({ placeholder: 'Select an area', data: areaNames }).on('select2:select', eventHandlers['dropdownClick']);
                s.setupCountryTitle(root_element);
                t.tsCountryTitle(country, 'country-title-container');
            }
            if (Object.keys(data['rtData']).length > 1) {
                s.addSourceSelect(root_element, 'source-select', Object.keys(data['rtData']), eventHandlers['sourceSelectClick'], fullWidth);
            }
            if (data['rtData'][activeSource]['rtData'] !== null) {
                s.setupRt(root_element);
                date_lims = getDateLims(data['rtData'][activeSource]['rtData'], onlyUnique);
            }
            if (data['rtData'][activeSource]['casesInfectionData'] !== null) {
                s.setupCasesInfection(root_element);
                date_lims = getDateLims(data['rtData'][activeSource]['casesInfectionData'], onlyUnique);
            }
            if (data['rtData'][activeSource]['casesReportData'] !== null) {
                s.setupCasesReport(root_element);
                date_lims = getDateLims(data['rtData'][activeSource]['casesReportData'], onlyUnique);
            }
            if (data['rtData'][activeSource]['rtData'] !== null || data['rtData'][activeSource]['casesInfectionData'] !== null || data['rtData'][activeSource]['casesReportData'] !== null) {
                s.setupControls(root_element, eventHandlers, date_lims, ts_color_ref);
            }
            s.setupFooter(root_element);
            t.plotAllTs(country, date_lims, data, activeSource, runDate);
            setActiveTime(date_lims);
        });
    };
    rtVis.prototype.getDateLims = function (data, onlyUnique) {
        var parseTime = d3.timeParse("%Y-%m-%d");
        var dates = data.map(function (d) { return (d['date']); }).filter(onlyUnique).map(function (d) { return (parseTime(d)); });
        return ([d3.min(dates), d3.max(dates)]);
    };
    rtVis.prototype.onlyUnique = function (value, index, self) {
        return self.indexOf(value) === index;
    };
    rtVis.prototype.setupPage = function (root_element) {
        this.setupFlex(root_element);
    };
    rtVis.prototype.createMap = function () {
        var i = new interact(this._config);
        var _config = this._config;
        var mapClick = i.mapClick.bind(this);
        var dropdownClick = i.dropdownClick.bind(this);
        var mapDataClick = i.mapDataClick.bind(this);
        var activeSource = this.activeSource;
        var activeMapData = this.activeMapData;
        this._requiredData.then(function (data) {
            var m = new map(_config);
            m.setupMap(data[0]['geoData'], data[0]['rtData'][activeSource]['summaryData'], mapClick, dropdownClick, mapDataClick, activeMapData);
        });
    };
    rtVis.prototype.plotRt = function (dataset) {
        var _config = this._config;
        var country = this.activeArea;
        var time = this.activeTime;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
    };
    rtVis.prototype.subRegion = function (s) {
        if (s.hasOwnProperty("Country")) {
            s.region = s.Country;
            delete s.Country;
            return (s);
        }
        else if (s.hasOwnProperty("country")) {
            s.region = s.country;
            delete s.country;
            return (s);
        }
        else if (s.hasOwnProperty("Region")) {
            s.region = s.Region;
            delete s.Region;
            return (s);
        }
        else {
            return (s);
        }
    };
    rtVis.prototype.zipObject = function (keys, values) {
        var result = {};
        keys.forEach(function (key, i) {
            result[key] = values[i];
        });
        return result;
    };
    ;
    rtVis.prototype.recursiveObjectPromiseAll = function (obj) {
        var _this = this;
        var keys = Object.keys(obj);
        return Promise.all(keys.map(function (key) {
            var value = obj[key];
            if (typeof value === 'object' && !value.then) {
                return _this.recursiveObjectPromiseAll(value);
            }
            return value;
        }))
            .then(function (result) { return _this.zipObject(keys, result); });
    };
    ;
    return rtVis;
}());
;;var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
try {
    var d3 = require('d3');
}
catch (err) { }
var interact = (function (_super) {
    __extends(interact, _super);
    function interact(x) {
        return _super.call(this, x) || this;
    }
    interact.prototype.mapClick = function (e) {
        this.activeArea = e.properties.sovereignt;
        var _config = this._config;
        var country = this.activeArea;
        var time = this.activeTime;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
    };
    interact.prototype.mapDataClick = function () {
        this.activeMapData = d3.select('#map-dataset-item-active').text();
        this.createMap();
    };
    interact.prototype.dropdownClick = function (e) {
        this.activeArea = e.params.data.text;
        var _config = this._config;
        var country = this.activeArea;
        var time = this.activeTime;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
        d3.select('#select2-dropdown-container-container').text(this.activeArea);
    };
    interact.prototype.timeBrush = function (date_lims) {
        var time = date_lims;
        var _config = this._config;
        var country = this.activeArea;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
        this.activeTime = time;
    };
    interact.prototype.sourceSelectClick = function (e) {
        this.activeSource = d3.select('#source-select :checked').text();
        var _config = this._config;
        var country = this.activeArea;
        var time = this.activeTime;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this.createMap();
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
    };
    return interact;
}(rtVis));;var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
try {
    var d3 = require('d3');
}
catch (err) { }
var setup = (function (_super) {
    __extends(setup, _super);
    function setup(x) {
        var _this = _super.call(this, x) || this;
        _this.margin = { top: 0, right: 40, bottom: 10, left: 10 };
        return _this;
    }
    setup.prototype.setupCountryTitle = function (root_element) {
        var ct = d3.select(root_element)
            .append('div')
            .attr('class', 'country-title-container')
            .attr('id', 'country-title-container');
    };
    setup.prototype.setupMap = function (root_element) {
        d3.select(root_element)
            .append('div')
            .attr('class', 'map-container')
            .attr('id', 'map-container');
    };
    setup.prototype.setupDropDown = function (root_element) {
        d3.select(root_element)
            .append('div')
            .attr('class', 'dropdown-container')
            .attr('id', 'dropdown-container');
    };
    setup.prototype.setupDownload = function (root_element, downloadUrl, fullWidth) {
        d3.select(root_element)
            .append('div')
            .attr('class', 'download-container')
            .attr('id', 'download-container')
            .style('left', fullWidth + 'px')
            .append('a')
            .attr("href", downloadUrl)
            .attr('target', '_blank')
            .text('Download Data');
    };
    setup.prototype.setupRt = function (root_element) {
        d3.select(root_element)
            .append('div')
            .attr('class', 'r0-title-container')
            .attr('id', 'r0-title-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'r0-ts-container')
            .attr('id', 'r0-ts-container');
    };
    setup.prototype.setupCasesInfection = function (root_element) {
        d3.select(root_element)
            .append('div')
            .attr('class', 'cases-infection-title-container')
            .attr('id', 'cases-infection-title-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'cases-infection-ts-container')
            .attr('id', 'cases-infection-ts-container');
    };
    setup.prototype.setupCasesReport = function (root_element) {
        d3.select(root_element)
            .append('div')
            .attr('class', 'cases-report-title-container')
            .attr('id', 'cases-report-title-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'cases-report-ts-container')
            .attr('id', 'cases-report-ts-container');
    };
    setup.prototype.setupControls = function (root_element, eventHandlersRef, date_lims, ts_color_ref) {
        d3.select(root_element)
            .append('div')
            .attr('class', 'controls-container')
            .attr('id', 'controls-container');
        d3.select('#controls-container')
            .append('div')
            .attr('class', 'controls-container-legend')
            .attr('id', 'controls-container-legend');
        d3.select('#controls-container')
            .append('div')
            .attr('class', 'controls-container-time')
            .attr('id', 'controls-container-time');
        d3.select('#controls-container-legend')
            .append('div')
            .text('Legend')
            .attr('class', 'ts-legend-text')
            .style('font-weight', 'bold')
            .style('padding-bottom', '20px');
        d3.select('#controls-container-legend')
            .append('div')
            .attr('id', 'controls-container-legend-items')
            .attr('class', 'controls-container-legend-items');
        d3.select('#controls-container-legend-items')
            .append('div')
            .attr('class', 'legend-e')
            .attr('id', 'legend-e');
        d3.select('#controls-container-legend-items')
            .append('div')
            .attr('class', 'legend-eb')
            .attr('id', 'legend-eb');
        d3.select('#controls-container-legend-items')
            .append('div')
            .attr('class', 'legend-f')
            .attr('id', 'legend-f');
        d3.select('#legend-e')
            .append('div')
            .style('width', '12px')
            .style('height', '12px')
            .attr('class', 'ts-legend-e')
            .style('background-color', ts_color_ref['poly_50_e']);
        d3.select('#legend-e')
            .append('div')
            .text('Estimate')
            .attr('class', 'ts-legend-text');
        d3.select('#legend-eb')
            .append('div')
            .style('width', '12px')
            .style('height', '12px')
            .attr('class', 'ts-legend-eb')
            .style('background-color', ts_color_ref['poly_50_eb']);
        d3.select('#legend-eb')
            .append('div')
            .text('Estimate based on partial data')
            .attr('class', 'ts-legend-text');
        d3.select('#legend-f')
            .append('div')
            .style('width', '12px')
            .style('height', '12px')
            .attr('class', 'ts-legend-f')
            .style('background-color', ts_color_ref['poly_50_f']);
        d3.select('#legend-f')
            .append('div')
            .text('Forecast')
            .attr('class', 'ts-legend-text');
        this.setupTimeControls(date_lims, 'controls-container-time', eventHandlersRef['timeBrush']);
    };
    setup.prototype.setupTimeControls = function (date_lims, container_id, date_handler) {
        d3.select('#' + container_id)
            .append('div')
            .text('Filter Date')
            .attr('class', 'ts-legend-text')
            .style('font-weight', 'bold')
            .style('padding-bottom', '10px');
        var svg_dims = document.getElementById(container_id).getBoundingClientRect();
        svg_dims.width = svg_dims.width - this.margin.left - this.margin.right;
        svg_dims.height = svg_dims.height - this.margin.top - this.margin.bottom;
        var svg = d3.select('#' + container_id)
            .append('svg')
            .attr('class', container_id + '-svg')
            .attr('id', container_id + '-svg')
            .style("width", '100%')
            .style("height", '100%')
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        var x = d3.scaleTime()
            .domain([date_lims[0], date_lims[1]])
            .range([0, svg_dims.width]);
        var y = d3.scaleLinear()
            .domain([0, 1])
            .range([svg_dims.height, 0]);
        svg.append("g")
            .attr("transform", "translate(0," + svg_dims.height + ")")
            .call(d3.axisBottom(x).ticks(6).tickSize([0]))
            .attr("class", 'time-xaxis');
        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("class", 'r0-yaxis')
            .style('display', 'none');
        var brush = d3.brushX()
            .extent([[this.margin.left, this.margin.top], [svg_dims.width - this.margin.right, svg_dims.height - this.margin.bottom]])
            .on("start end", brushed);
        svg.call(d3.brushX()
            .extent([[0, 0], [svg_dims.width, svg_dims.height]]).on("start brush end", brushed));
        function brushed(e) {
            var maxDate = d3.select(d3.selectAll('.handle--e')._groups[0][0]).attr('x');
            var minDate = d3.select(d3.selectAll('.handle--w')._groups[0][0]).attr('x');
            if ((maxDate - minDate) <= 4) {
                date_handler([date_lims[0], date_lims[1]]);
            }
            else {
                date_handler([x.invert(minDate), x.invert(maxDate)]);
            }
        }
    };
    setup.prototype.setupFooter = function (root_element) {
        d3.select(root_element)
            .append('div')
            .attr('class', 'footer');
    };
    setup.prototype.addSourceSelect = function (root_element, id, elements, eventhandler, fullWidth) {
        if (fullWidth === undefined) {
            fullWidth = 1000;
        }
        var div = d3.select(root_element)
            .append('select')
            .attr('class', id)
            .attr('id', id)
            .style('left', fullWidth + 'px')
            .on('change', eventhandler);
        var i;
        for (i = 0; i < elements.length; i++) {
            div.append('option')
                .text(elements[i]);
        }
    };
    setup.prototype.addButtonSpacer = function (id) {
        d3.select(id)
            .append('div')
            .attr('class', 'button-spacer');
    };
    return setup;
}(rtVis));;var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
try {
    var d3 = require('d3');
}
catch (err) { }
var map = (function (_super) {
    __extends(map, _super);
    function map(x) {
        return _super.call(this, x) || this;
    }
    map.prototype.setupMap = function (geoData, summaryData, mapClick, dropdownClick, mapDataClick, activeMapData) {
        d3.select("#map-svg").remove();
        d3.select('#map-container-tooltip').remove();
        d3.select('#map-legend').remove();
        var map_svg = d3.select("#map-container")
            .append('svg')
            .attr('class', 'map-svg')
            .attr('id', 'map-svg')
            .style("width", '100%')
            .style("height", '100%');
        var tooltip = d3.select("#map-container")
            .append("div")
            .style("opacity", 0)
            .attr("class", 'tooltip')
            .attr('id', 'map-container-tooltip');
        var map_svg_dims = document.getElementById('map-container').getBoundingClientRect();
        var projection = d3.geoCylindricalStereographic();
        var path = d3.geoPath().projection(projection);
        var scaleCenter = this.calculateScaleCenter(geoData, map_svg_dims.width, map_svg_dims.height, path);
        var projection = d3.geoCylindricalStereographic()
            .translate([map_svg_dims.width / 2, map_svg_dims.height / 2])
            .scale(scaleCenter.scale)
            .center(scaleCenter.center);
        this.projection = projection;
        this.map_svg_dims = map_svg_dims;
        this.summaryData = summaryData;
        this.mapDataClick = mapDataClick;
        var path = d3.geoPath().projection(projection);
        var colour_ref = { 'Expected change in daily cases': { 'Decreasing': '#1170aa',
                'Likely decreasing': '#5fa2ce',
                'Unsure': '#7b848f',
                'Likely increasing': '#fd9e49',
                'Increasing': '#e75f00',
                'No Data': 'lightgray' },
            'New confirmed cases by infection date': { 'No Data': 'lightgray',
                'Numeric': d3.scaleLinear().range(["white", "blue"]) },
            'Effective reproduction no.': { 'No Data': 'lightgray',
                'Numeric': d3.scaleLinear().range(["white", "red"]) },
            'Rate of growth': { 'No Data': 'lightgray',
                'Numeric': d3.scaleLinear().range(["white", "green"]) },
            'Doubling/halving time (days)': { 'No Data': 'lightgray',
                'Numeric': d3.scaleLinear().range(["white", "purple"]) } };
        var map_data_values = this.prepareMapData(summaryData, activeMapData);
        if (typeof (map_data_values[0]) === 'number') {
            var legend_max = d3.max(map_data_values);
            var legend_min = d3.min(map_data_values);
            colour_ref[activeMapData]['Numeric'] = colour_ref[activeMapData]['Numeric'].domain([legend_min, legend_max]);
        }
        else {
            legend_min = 0;
            legend_max = 0;
        }
        var parseMapData = this.parseMapData;
        var pallette = this.pallette;
        map_svg.append("g")
            .attr("class", "areas")
            .selectAll("path")
            .data(geoData.features)
            .enter().append("path")
            .attr('class', 'area-poly')
            .attr("d", path)
            .attr("stroke", "white")
            .attr("summary", function (d) {
            try {
                var summary_val = summaryData.filter(function (a) { return a['region'] == d.properties.sovereignt; })[0][activeMapData];
                if (summary_val === 'NA') {
                    throw 'Some summary values are null';
                }
                return summary_val;
            }
            catch (_a) {
                return 'No Data';
            }
            ;
        })
            .attr("country-name", function (d) { return d.properties.sovereignt; })
            .attr("fill", function (d) {
            return (pallette(parseMapData(d3.select(this).attr('summary')), colour_ref[activeMapData]));
        })
            .on('mouseenter', this.mapMouseIn.bind(this))
            .on("mouseout", this.mapMouseOut)
            .on("mouseover", this.mapMouseOver)
            .on('click', mapClick)
            .style('stroke', 'black')
            .style('stroke-width', '0.2px');
        this.createLegend(map_svg, map_svg_dims, colour_ref[activeMapData], activeMapData, legend_max, legend_min);
        var areaNames = geoData.features.map(function (d) { return (d.properties.sovereignt); }).filter(this.onlyUnique).sort();
        $('#dropdown-container').append('.js-example-basic-single').select2({ placeholder: 'Select a country', data: areaNames }).on('select2:select', dropdownClick);
    };
    map.prototype.prepareMapData = function (summaryData, variable) {
        var _this = this;
        return (summaryData.map(function (a) { return _this.parseMapData(a[variable]); }));
    };
    map.prototype.parseMapData = function (d) {
        if (['Decreasing', 'Likely decreasing', 'Unsure', 'Likely increasing', 'Increasing', 'No Data'].includes(d)) {
            return (d);
        }
        else {
            return (parseFloat(d.split(' ')[0]));
        }
    };
    map.prototype.pallette = function (d, pal) {
        if (typeof (d) === 'number') {
            return (pal['Numeric'](d));
        }
        else {
            return (pal[d]);
        }
    };
    map.prototype.mapMouseIn = function (e) {
        var x_coords = e.geometry.coordinates[0][0].map(function (x) { return (x[0]); });
        var y_coords = e.geometry.coordinates[0][0].map(function (x) { return (x[1]); });
        var x_coord = d3.mean(x_coords);
        var y_coord = d3.max(y_coords);
        var tooltip = d3.select('#map-container-tooltip');
        tooltip
            .style("opacity", 1);
        var tooltip_position = this.projection([x_coord, y_coord]);
        x_coord = tooltip_position[0] + 50;
        y_coord = tooltip_position[1] - this.map_svg_dims.height - 50;
        tooltip
            .style("left", x_coord + "px")
            .style("top", y_coord + "px");
        var tooltip_data = this.summaryData.filter(function (a) { return a.region == e.properties.sovereignt; })[0];
        try {
            var tooltip_str = '<b>' + e.properties.sovereignt + '</b>' + '</br>' + '</br>' +
                Object.keys(tooltip_data).map(function (key) {
                    if (key !== 'region') {
                        return "" + key + ": " + tooltip_data[key];
                    }
                }).join("</br> </br>");
        }
        catch (_a) {
            var tooltip_str = '';
        }
        if (tooltip_str === '') {
            tooltip
                .style("opacity", 0);
        }
        else {
            tooltip.html(tooltip_str);
        }
    };
    map.prototype.mapMouseOver = function (e) {
        d3.select(this)
            .style('stroke', 'black')
            .style('stroke-width', '1.5px');
    };
    map.prototype.mapMouseOut = function (e) {
        d3.select(this)
            .style('stroke', 'black')
            .style('stroke-width', '0.2px');
        var tooltip = d3.select('#map-container-tooltip');
        tooltip
            .style("opacity", 0);
    };
    map.prototype.createLegend = function (map_svg, map_svg_dims, colour_ref, activeMapData, legend_max, legend_min) {
        var legend_height = 200;
        var legend_x = map_svg_dims.width / 30;
        var legend_y = map_svg_dims.height / 2;
        var legendClick = function (x) {
            if (d3.selectAll('#map-legend-text').style('opacity') === '1') {
                d3.selectAll('#map-legend-text').style('opacity', 0);
                d3.selectAll('#map-legend-item').style('opacity', 0);
                d3.selectAll('#map-legend-rect').transition().duration(250).attr('width', '260px').attr('height', '200px');
                d3.selectAll('#map-dataset-text').transition().duration(250).delay(100).style('opacity', 1);
                d3.selectAll('#map-dataset-item-active').transition().duration(250).delay(100).style('opacity', 1);
                d3.selectAll('#map-dataset-item').transition().duration(250).delay(100).style('opacity', 1);
                d3.selectAll('#map-dataset-item').style('pointer-events', null);
            }
            else if (d3.selectAll('#map-dataset-text').style('opacity') === '1') {
                d3.selectAll('#map-dataset-text').style('opacity', 0);
                d3.selectAll('#map-dataset-item-active').style('opacity', 0);
                d3.selectAll('#map-dataset-item').style('opacity', 0);
                d3.selectAll('#map-legend-rect').transition().duration(250).attr('width', '64px').attr('height', '25px');
                legend.append('text')
                    .text('Legend')
                    .attr('x', legend_x - 2)
                    .attr('y', legend_y - 2.5)
                    .style('font-size', '14px')
                    .attr('id', 'map-legend-title')
                    .style('opacity', 0)
                    .transition().duration(250)
                    .style('opacity', 1);
            }
            else {
                d3.selectAll('#map-legend-text').transition().duration(250).delay(100).style('opacity', 1);
                d3.selectAll('#map-legend-item').transition().duration(250).delay(100).style('opacity', 1);
                d3.selectAll('#map-legend-rect').transition().duration(250).attr('width', '260px').attr('height', '200px');
                d3.select('#map-legend-title').remove();
            }
        };
        var legend = map_svg.append('g')
            .attr('class', 'map-legend')
            .attr('id', 'map-legend')
            .on('click', legendClick);
        legend.append('rect')
            .attr('x', legend_x - 10)
            .attr('y', legend_y - 20)
            .attr('width', '64px')
            .attr('height', '25px')
            .attr('class', 'map-legend-rect')
            .attr('id', 'map-legend-rect')
            .style('stroke', 'black')
            .style('fill', 'white')
            .style('rx', '8px');
        this.layoutLegend(legend, activeMapData, colour_ref, legend_x, legend_y, legend_height, legend_max, legend_min);
        this.layoutDatasetSelect(legend, activeMapData, legend_x, legend_y, legend_height);
    };
    map.prototype.layoutDatasetSelect = function (legend, activeMapData, legend_x, legend_y, legend_height) {
        var g = legend.append('g')
            .attr('id', 'map-dataset-content')
            .attr('class', 'map-dataset-content');
        g.append('text').text('Dataset Selection')
            .style('font-size', '14px')
            .style('padding-top', '10px')
            .attr('class', 'map-dataset-text')
            .attr('id', 'map-dataset-text')
            .attr('x', legend_x)
            .attr('y', legend_y);
        var map_datasets = Object.keys(this.summaryData[0]).filter(function (a) { return a !== 'region'; });
        var i;
        for (i = 0; i < map_datasets.length; i++) {
            g.append('rect')
                .attr("x", legend_x)
                .attr("y", (legend_y + ((legend_height / 6.5) * (i + 1))) + 5 - 20)
                .attr('rx', '15')
                .style("width", '240px')
                .style("height", '25px')
                .style('fill', 'lightgrey')
                .attr('class', 'map-dataset-item')
                .attr('id', 'map-dataset-item');
            g.append('text')
                .attr("x", legend_x + 8)
                .attr("y", (legend_y + ((legend_height / 6.5) * (i + 1))) + 15 - 14)
                .text(map_datasets[i])
                .style('font-size', '12px')
                .style('padding-left', '10px')
                .attr('class', 'map-dataset-item')
                .attr('id', 'map-dataset-item')
                .on('click', this.mapDataClick)
                .on('mouseenter', function (e) { d3.select(this).attr('id', 'map-dataset-item-active').style('font-weight', 'bold'); })
                .on('mouseout', function (e) { d3.select(this).attr('id', 'map-dataset-item').style('font-weight', 'normal'); });
        }
        d3.selectAll('#map-dataset-text').style('opacity', 0);
        d3.selectAll('#map-dataset-item').style('opacity', 0);
        d3.selectAll('#map-dataset-item').style('pointer-events', 'none');
    };
    map.prototype.layoutLegend = function (legend, activeMapData, colour_ref, legend_x, legend_y, legend_height, legend_max, legend_min) {
        var floatFormat = /\B(?=(\d{3})+(?!\d))/g;
        var g = legend.append('g')
            .attr('id', 'map-legend-content')
            .attr('class', 'map-legend-content');
        g.append('text').text('Legend').attr('x', legend_x - 2).attr('y', legend_y - 2.5).style('font-size', '14px').attr('id', 'map-legend-title');
        g.append('text').text(activeMapData)
            .style('font-size', '14px')
            .style('padding-top', '10px')
            .attr('class', 'map-legend-text')
            .attr('id', 'map-legend-text')
            .attr('x', legend_x)
            .attr('y', legend_y);
        if (legend_max > 0) {
            var numeric_palette = true;
        }
        else {
            var numeric_palette = false;
        }
        var i;
        for (i = 0; i < Object.entries(colour_ref).length; i++) {
            if (numeric_palette) {
                if (i === 1) {
                    var defs = g.append("defs");
                    var linearGradient = defs.append("linearGradient")
                        .attr("id", "linear-gradient")
                        .attr("x1", "0%")
                        .attr("y1", "0%")
                        .attr("x2", "0%")
                        .attr("y2", "100%");
                    linearGradient.append("stop")
                        .attr("offset", "0%")
                        .attr("stop-color", "white");
                    linearGradient.append("stop")
                        .attr("offset", "100%")
                        .attr("stop-color", colour_ref['Numeric'](legend_max));
                    g.append('rect')
                        .attr("x", legend_x)
                        .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 5 - 20)
                        .style("width", '12px')
                        .style("height", '120px')
                        .attr('class', 'map-legend-item')
                        .attr('id', 'map-legend-item')
                        .style("fill", "url(#linear-gradient)");
                    var tickRange = this.legendTicks(legend_min, legend_max, 4).concat([legend_max]);
                    var i;
                    for (i = 0; i < 5; i++) {
                        g.append('text')
                            .attr("x", legend_x + 23)
                            .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 20)
                            .text((Math.round(((tickRange[i]) + Number.EPSILON) * 100) / 100).toString().replace(floatFormat, ","))
                            .style('font-size', '12px')
                            .style('padding-left', '10px')
                            .attr('class', 'map-legend-item')
                            .attr('id', 'map-legend-item');
                    }
                }
                else {
                    g.append('rect')
                        .attr("x", legend_x)
                        .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 5 - 20)
                        .style("width", '12px')
                        .style("height", '12px')
                        .style('fill', Object.entries(colour_ref)[i][1])
                        .attr('class', 'map-legend-item')
                        .attr('id', 'map-legend-item');
                    g.append('text')
                        .attr("x", legend_x + 23)
                        .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 15 - 20)
                        .text(Object.entries(colour_ref)[i][0])
                        .style('font-size', '12px')
                        .style('padding-left', '10px')
                        .attr('class', 'map-legend-item')
                        .attr('id', 'map-legend-item');
                }
            }
            else {
                g.append('rect')
                    .attr("x", legend_x)
                    .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 5 - 20)
                    .style("width", '12px')
                    .style("height", '12px')
                    .style('fill', Object.entries(colour_ref)[i][1])
                    .attr('class', 'map-legend-item')
                    .attr('id', 'map-legend-item');
                g.append('text')
                    .attr("x", legend_x + 23)
                    .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 15 - 20)
                    .text(Object.entries(colour_ref)[i][0])
                    .style('font-size', '12px')
                    .style('padding-left', '10px')
                    .attr('class', 'map-legend-item')
                    .attr('id', 'map-legend-item');
            }
            d3.selectAll('#map-legend-text').style('opacity', 0);
            d3.selectAll('#map-legend-item').style('opacity', 0);
        }
    };
    map.prototype.legendTicks = function (min, max, outlength) {
        var step = (max - min) / outlength;
        return (Array.from({ length: outlength }, function (x, i) { return (step * i) + min; }));
    };
    map.prototype.calculateScaleCenter = function (features, map_width, map_height, path) {
        var bbox_path = path.bounds(features), scale = 120 / Math.max((bbox_path[1][0] - bbox_path[0][0]) / map_width, (bbox_path[1][1] - bbox_path[0][1]) / map_height);
        var bbox_feature = d3.geoBounds(features), center = [
            (bbox_feature[1][0] + bbox_feature[0][0]) / 2,
            (bbox_feature[1][1] + bbox_feature[0][1]) / 2
        ];
        return {
            'scale': scale,
            'center': center
        };
    };
    map.prototype.onlyUnique = function (value, index, self) {
        return self.indexOf(value) === index;
    };
    return map;
}(rtVis));
;;var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
try {
    var d3 = require('d3');
}
catch (err) { }
var ts = (function (_super) {
    __extends(ts, _super);
    function ts(x) {
        var _this = _super.call(this, x) || this;
        _this.margin = { top: 10, right: 30, bottom: 30, left: 60 };
        return _this;
    }
    ts.prototype.plotTs = function (rtData, country, time, cases_data, container_id, runDate, r0) {
        if (runDate === void 0) { runDate = undefined; }
        if (r0 === void 0) { r0 = false; }
        d3.select("#" + container_id + '-svg').remove();
        d3.select('#' + container_id + '-tooltip').remove();
        rtData = rtData.filter(function (a) { return a['region'] == country; });
        try {
            cases_data = cases_data.filter(function (a) { return a['region'] == country; });
        }
        catch (_a) { }
        try {
            if (!r0) {
                var max_observed_cases = d3.max(cases_data, function (d) { return parseFloat(d.confirm); });
            }
            else {
                var max_observed_cases = null;
            }
        }
        catch (_b) {
            var max_observed_cases = null;
        }
        var parseTime = d3.timeParse("%Y-%m-%d");
        var ts_svg = d3.select("#" + container_id)
            .append('svg')
            .attr('class', container_id + '-svg')
            .attr('id', container_id + '-svg')
            .style("width", '100%')
            .style("height", '100%')
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        var ts_svg_dims = document.getElementById(container_id).getBoundingClientRect();
        ts_svg_dims.width = ts_svg_dims.width - this.margin.left - this.margin.right;
        ts_svg_dims.height = ts_svg_dims.height - this.margin.top - this.margin.bottom;
        var minDate = d3.min(rtData.map(function (x) { return (parseTime(x['date'])); }));
        var maxDate = time[1];
        rtData = rtData.filter(function (a) { return parseTime(a['date']) >= minDate; });
        rtData = rtData.filter(function (a) { return parseTime(a['date']) <= maxDate; });
        try {
            cases_data = cases_data.filter(function (a) { return d3.timeDay.offset(parseTime(a['date']), -1) >= minDate; });
        }
        catch (_c) { }
        if (rtData.length === 0) {
            ts_svg.append('text')
                .attr('x', ts_svg_dims.width / 2)
                .attr('y', ts_svg_dims.height / 2)
                .text('No data')
                .style('font-size', '20px')
                .style('stroke-width', 0)
                .style('fill', 'gray');
            return;
        }
        try {
            var cases_max = d3.max(cases_data, function (d) { return parseFloat(d.confirm); });
        }
        catch (_d) { }
        var ymax = d3.max(rtData, function (d) { return parseFloat(d.upper_90); });
        if (!r0) {
            try {
                ymax = this.gt_max_observed_cases(d3.max([ymax, cases_max]), max_observed_cases);
            }
            catch (_e) { }
        }
        var y = d3.scaleLinear()
            .domain([0, ymax])
            .range([ts_svg_dims.height, 0]);
        var x = d3.scaleTime()
            .domain([minDate, maxDate])
            .range([0, ts_svg_dims.width]);
        var line = d3.line()
            .x(function (d) { return x(parseTime(d['date'])); })
            .y(function (d) { return y(1); })
            .curve(d3.curveCardinal);
        var estimate_data = rtData.filter(function (a) { return a['type'] == 'estimate'; });
        var estimate_b_data = rtData.filter(function (a) { return a['type'] == 'estimate based on partial data'; });
        var forecast_data = rtData.filter(function (a) { return a['type'] == 'forecast'; });
        var poly_90 = this.plotHPoly('date', 'upper_90', 'lower_90', x, y, parseTime, max_observed_cases, this.gt_max_observed_cases);
        var poly_50 = this.plotHPoly('date', 'upper_50', 'lower_50', x, y, parseTime, max_observed_cases, this.gt_max_observed_cases);
        var poly_20 = this.plotHPoly('date', 'upper_20', 'lower_20', x, y, parseTime, max_observed_cases, this.gt_max_observed_cases);
        if (!r0) {
            try {
                ts_svg.selectAll('rect')
                    .data(cases_data)
                    .enter()
                    .append('rect')
                    .attr('x', function (d, i) { return x(d3.timeDay.offset(parseTime(d.date), -0.5)); })
                    .attr("width", function (d) { return 0.8 * (x(d3.timeDay.offset(parseTime(d.date), 1)) - x(parseTime(d.date))); })
                    .attr("height", 0)
                    .attr("y", ts_svg_dims.height)
                    .transition()
                    .duration(250)
                    .delay(function (d, i) {
                    return i * 4;
                })
                    .attr('height', function (d, i) { return ts_svg_dims.height - y(d.confirm); })
                    .attr('y', function (d, i) { return y(d.confirm); })
                    .attr('class', 'cases_bar');
            }
            catch (_f) { }
        }
        this.addEstimatePolys(ts_svg, estimate_data, poly_90, 'poly_90_e', this.ts_color_ref);
        this.addEstimatePolys(ts_svg, estimate_b_data, poly_90, 'poly_90_eb', this.ts_color_ref);
        this.addEstimatePolys(ts_svg, forecast_data, poly_90, 'poly_90_f', this.ts_color_ref);
        this.addEstimatePolys(ts_svg, estimate_data, poly_50, 'poly_50_e', this.ts_color_ref);
        this.addEstimatePolys(ts_svg, estimate_b_data, poly_50, 'poly_50_eb', this.ts_color_ref);
        this.addEstimatePolys(ts_svg, forecast_data, poly_50, 'poly_50_f', this.ts_color_ref);
        this.addEstimatePolys(ts_svg, estimate_data, poly_20, 'poly_20_e', this.ts_color_ref);
        this.addEstimatePolys(ts_svg, estimate_b_data, poly_20, 'poly_20_eb', this.ts_color_ref);
        this.addEstimatePolys(ts_svg, forecast_data, poly_20, 'poly_20_f', this.ts_color_ref);
        if (r0) {
            ts_svg.append("path")
                .datum(rtData)
                .attr("d", line)
                .attr("class", 'r0_line')
                .style('stroke', 'black')
                .style('stroke-dasharray', "5,5");
        }
        ts_svg.append("g")
            .attr("transform", "translate(0," + ts_svg_dims.height + ")")
            .call(d3.axisBottom(x))
            .attr("class", 'r0-xaxis');
        ts_svg.append("g")
            .call(d3.axisLeft(y))
            .attr("class", 'r0-yaxis');
        ts_svg.append('line')
            .attr('id', container_id + '-hover-line')
            .attr("x1", 20)
            .attr("y1", 0)
            .attr("x2", 20)
            .attr("y2", ts_svg_dims.height)
            .attr('stroke', 'black')
            .attr('stroke-width', '1px')
            .attr('stroke-opacity', 0);
        if (typeof (runDate) !== 'undefined') {
            ts_svg.append('line')
                .attr('id', 'run-date-line')
                .attr("x1", x(parseTime(runDate)))
                .attr("y1", 0)
                .attr("x2", x(parseTime(runDate)))
                .attr("y2", ts_svg_dims.height)
                .attr('stroke', 'lightgrey')
                .style('stroke-dasharray', "5,5");
        }
        var tooltip = d3.select("#" + container_id)
            .append("div")
            .style("opacity", 0)
            .attr("class", 'tooltip')
            .attr('id', container_id + '-tooltip');
        function tsMouseIn(e) {
            d3.select('#' + container_id + '-tooltip')
                .style("opacity", 1);
            d3.select('#' + container_id + '-hover-line')
                .attr('stroke-opacity', 1);
        }
        function tsMouseOut(e) {
            d3.select('#' + container_id + '-tooltip')
                .style("opacity", 0);
            d3.select('#' + container_id + '-hover-line')
                .attr('stroke-opacity', 0);
        }
        var floatFormat = /\B(?=(\d{3})+(?!\d))/g;
        var gt_max_observed_cases = this.gt_max_observed_cases;
        function tsMouseMove() {
            var _this = this;
            d3.select('#' + container_id + '-hover-line')
                .attr('x1', d3.mouse(this)[0])
                .attr('x2', d3.mouse(this)[0]);
            var mousedata = rtData.filter(function (a) { return parseTime(a['date']).toDateString() == x.invert(d3.mouse(_this)[0]).toDateString(); });
            var mousecasesdata = cases_data.filter(function (a) { return parseTime(a['date']).toDateString() == x.invert(d3.mouse(_this)[0]).toDateString(); });
            var tooltip_str = '<b>' + parseTime(mousedata[0]['date']).toDateString() + '</b>' +
                '<br>' +
                '20% CI: ' + parseFloat(gt_max_observed_cases(mousedata[0]['lower_20'], max_observed_cases)).toString().replace(floatFormat, ",") + ' to ' + parseFloat(gt_max_observed_cases(mousedata[0]['upper_20'], max_observed_cases)).toString().replace(floatFormat, ",") +
                '<br>' +
                '50% CI: ' + parseFloat(gt_max_observed_cases(mousedata[0]['lower_50'], max_observed_cases)).toString().replace(floatFormat, ",") + ' to ' + parseFloat(gt_max_observed_cases(mousedata[0]['upper_50'], max_observed_cases)).toString().replace(floatFormat, ",") +
                '<br>' +
                '90% CI: ' + parseFloat(gt_max_observed_cases(mousedata[0]['lower_90'], max_observed_cases)).toString().replace(floatFormat, ",") + ' to ' + parseFloat(gt_max_observed_cases(mousedata[0]['upper_90'], max_observed_cases)).toString().replace(floatFormat, ",");
            if (!r0) {
                try {
                    tooltip_str = tooltip_str + '<br>' + 'Confirmed: ' + parseFloat(mousecasesdata[0]['confirm']);
                }
                catch (_a) { }
            }
            var x_offset;
            if (ts_svg_dims.width - d3.mouse(this)[0] < 80) {
                x_offset = -70;
            }
            else {
                x_offset = 70;
            }
            tooltip.html(tooltip_str)
                .style("left", (d3.mouse(this)[0] + x_offset) + "px")
                .style("top", (d3.mouse(this)[1] - 200) + "px");
        }
        ts_svg.append("rect")
            .attr("class", "overlay")
            .attr("width", ts_svg_dims.width)
            .attr("height", ts_svg_dims.height)
            .on('mousemove', tsMouseMove)
            .on('mouseenter', tsMouseIn)
            .on('mouseout', tsMouseOut)
            .attr('fill-opacity', '0');
    };
    ts.prototype.addEstimatePolys = function (svg, data, poly, id, ts_color_ref) {
        svg.append("path")
            .datum(data)
            .attr("d", poly)
            .attr("class", id)
            .style('fill', ts_color_ref[id]);
    };
    ts.prototype.plotAllTs = function (country, time, data, activeSource, runDate) {
        if (runDate === void 0) { runDate = undefined; }
        this.tsCountryTitle(country, 'country-title-container');
        if (data['rtData'][activeSource]['rtData'] !== null) {
            this.plotTs(data['rtData'][activeSource]['rtData'], country, time, data['rtData'][activeSource]['obsCasesData'], 'r0-ts-container', runDate, true);
            this.tsDataTitle('R', 'r0-title-container');
        }
        if (data['rtData'][activeSource]['casesInfectionData'] !== null) {
            this.plotTs(data['rtData'][activeSource]['casesInfectionData'], country, time, data['rtData'][activeSource]['obsCasesData'], 'cases-infection-ts-container', runDate, false);
            this.tsDataTitle('Cases by date of infection', 'cases-infection-title-container');
        }
        if (data['rtData'][activeSource]['casesReportData'] !== null) {
            this.plotTs(data['rtData'][activeSource]['casesReportData'], country, time, data['rtData'][activeSource]['obsCasesData'], 'cases-report-ts-container', runDate, false);
            this.tsDataTitle('Cases by date of report', 'cases-report-title-container');
        }
    };
    ts.prototype.tsDataTitle = function (dataset, container_id) {
        d3.select("#" + container_id).text(dataset);
    };
    ts.prototype.tsCountryTitle = function (country, container_id) {
        try {
            if (Object.keys(this._subregional_ref).includes(country)) {
                var text = '<a href="' + this._subregional_ref[country] + '" target="_blank" style="font-size:14px;">Detailed estimates available</a>';
            }
            else {
                text = '';
            }
        }
        catch (_a) { }
        d3.select("#" + container_id).html(country);
        try {
            d3.select("#" + container_id).append('div').attr('id', 'subregional-link').html(text);
        }
        catch (_b) { }
    };
    ts.prototype.plotHPoly = function (x, y0, y1, x_scale, y_scale, parseTime, max_observed_cases, gt_max_observed_cases) {
        if (parseTime === void 0) { parseTime = null; }
        if (parseTime !== null) {
            var poly = d3.area()
                .x(function (d) { return x_scale(parseTime(d[x])); })
                .y0(function (d) { return y_scale(gt_max_observed_cases(d[y0], max_observed_cases)); })
                .y1(function (d) { return y_scale(gt_max_observed_cases(d[y1], max_observed_cases)); });
        }
        else {
            var poly = d3.area()
                .x(function (d) { return x_scale(d[x]); })
                .y0(function (d) { return y_scale(gt_max_observed_cases(d[y0], max_observed_cases)); })
                .y1(function (d) { return y_scale(gt_max_observed_cases(d[y1], max_observed_cases)); });
        }
        return (poly);
    };
    ts.prototype.gt_max_observed_cases = function (x, max_observed_cases) {
        if (max_observed_cases !== null) {
            if (x >= max_observed_cases * 5) {
                return (max_observed_cases * 5);
            }
            else {
                return (x);
            }
        }
        else {
            return (x);
        }
    };
    return ts;
}(rtVis));
;
//# sourceMappingURL=build.js.map