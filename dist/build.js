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
        this.sourceDeaths = false;
        this.activeSource = Object.keys(x['rtData'])[0];
        var available_rt_data = Object.values(x['rtData'][this.activeSource]).filter(function (x) { return x !== null; });
        if (!available_rt_data[0].then) {
            this._requiredData = Promise.all([{ 'geoData': x['geoData'],
                    'summaryData': x['summaryData'],
                    'rtData': x['rtData'],
                    'obsCasesData': x['obsCasesData'] }
            ]);
        }
        else {
            this._requiredData = this.recursiveObjectPromiseAll([{ 'geoData': x['geoData'],
                    'summaryData': x['summaryData'],
                    'rtData': x['rtData']
                }]);
        }
        this._dataset_ref = [{ 'geoData': { 'index': 0, 'title': 'Geography' } },
            { 'summaryData': { 'index': 1, 'title': 'Summary' } },
            { 'rtData': { 'rtData': { 'index': 0, 'title': 'R' },
                    'casesInfectionData': { 'index': 1, 'title': 'Cases by date of infection' },
                    'casesReportData': { 'index': 2, 'title': 'Cases by date of report' } } },
            { 'obsCasesData': { 'index': 5, 'title': 'Observed cases' } },
        ];
        this._subregional_ref = x['subregional_ref'];
        this._availableData = [];
    }
    rtVis.prototype.setupFlex = function (root_element) {
        var onlyUnique = function (value, index, self) {
            return self.indexOf(value) === index;
        };
        var containsAll = function (arr, target) { return target.every(function (v) { return arr.includes(v); }); };
        var eventHandlers = {
            'time7ButtonClick': this.time7ButtonClick.bind(this),
            'time14ButtonClick': this.time14ButtonClick.bind(this),
            'time30ButtonClick': this.time30ButtonClick.bind(this),
            'timeAllButtonClick': this.timeAllButtonClick.bind(this),
            'dropdownClick': this.dropdownClick.bind(this),
            'sourceSelectClick': this.sourceSelectClick.bind(this)
        };
        var _dataset_ref = this._dataset_ref;
        var _config = this._config;
        var getAvailableData = this.getAvailableData;
        var country = this.activeArea;
        var time = this.activeTime;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            data = data[0];
            var s = new setup(_config);
            var t = new ts(_config);
            s.setupDropDown(root_element);
            if (data['geoData'] !== null && data['summaryData'] !== null) {
                s.setupMap(root_element);
            }
            try {
                var areaNames = data['rtData'][activeSource]['rtData'].map(function (d) { return (d.country); }).filter(onlyUnique).sort();
            }
            catch (_a) { }
            try {
                var areaNames = data['rtData'][activeSource]['casesInfectionData'].map(function (d) { return (d.country); }).filter(onlyUnique).sort();
            }
            catch (_b) { }
            try {
                var areaNames = data['rtData'][activeSource]['casesReportData'].map(function (d) { return (d.country); }).filter(onlyUnique).sort();
            }
            catch (_c) { }
            $('#dropdown-container').append('.js-example-basic-single').select2({ placeholder: 'Select an area', data: areaNames }).on('select2:select', eventHandlers['dropdownClick']);
            if (Object.keys(data['rtData']).length > 1) {
                s.addSourceSelect(root_element, 'source-select', Object.keys(data['rtData']), eventHandlers['sourceSelectClick']);
            }
            s.setupCountryTitle(root_element);
            t.tsCountryTitle(country, 'country-title-container');
            if (data['rtData'][activeSource]['rtData'] !== null) {
                s.setupRt(root_element);
            }
            if (data['rtData'][activeSource]['casesInfectionData'] !== null) {
                s.setupCasesInfection(root_element);
            }
            if (data['rtData'][activeSource]['casesReportData'] !== null) {
                s.setupCasesReport(root_element);
            }
            if (data['rtData'][activeSource]['rtData'] !== null || data['rtData'][activeSource]['casesInfectionData'] !== null || data['rtData'][activeSource]['casesReportData'] !== null) {
                s.setupControls(root_element, eventHandlers);
            }
            s.setupFooter(root_element);
            t.plotAllTs(country, time, data, activeSource, runDate);
        });
    };
    rtVis.prototype.getAvailableData = function (data, _dataset_ref) {
        var availableData = data.map(function (e, i) { return e !== null ? i : ''; }).filter(String);
        availableData = availableData.map(function (item) { return _dataset_ref[item]; });
        availableData = availableData.map(function (item) { return (Object.keys(item)); }).flat();
        return (availableData);
    };
    rtVis.prototype.setupPage = function (root_element) {
        this.setupFlex(root_element);
    };
    rtVis.prototype.createMap = function () {
        var _config = this._config;
        var mapClick = this.mapClick.bind(this);
        var dropdownClick = this.dropdownClick.bind(this);
        var getAvailableData = this.getAvailableData;
        this._requiredData.then(function (data) {
            var m = new map(_config);
            m.setupMap(data[0]['geoData'], data[0]['summaryData'], mapClick, dropdownClick);
        });
    };
    rtVis.prototype.plotRt = function (dataset) {
        var _config = this._config;
        var _dataset_ref = this._dataset_ref;
        var country = this.activeArea;
        var time = this.activeTime;
        var getAvailableData = this.getAvailableData;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
    };
    rtVis.prototype.time7ButtonClick = function () {
        var _config = this._config;
        var _dataset_ref = this._dataset_ref;
        var country = this.activeArea;
        var getAvailableData = this.getAvailableData;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            var time = '7d';
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
        this.activeTime = '7d';
    };
    rtVis.prototype.time14ButtonClick = function () {
        var _config = this._config;
        var _dataset_ref = this._dataset_ref;
        var country = this.activeArea;
        var getAvailableData = this.getAvailableData;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            var time = '14d';
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
        this.activeTime = '14d';
    };
    rtVis.prototype.time30ButtonClick = function () {
        var _config = this._config;
        var _dataset_ref = this._dataset_ref;
        var country = this.activeArea;
        var getAvailableData = this.getAvailableData;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            var time = '30d';
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
        this.activeTime = '30d';
    };
    rtVis.prototype.timeAllButtonClick = function () {
        var _config = this._config;
        var _dataset_ref = this._dataset_ref;
        var country = this.activeArea;
        var getAvailableData = this.getAvailableData;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            var time = 'all';
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
        this.activeTime = 'all';
    };
    rtVis.prototype.mapClick = function (e) {
        this.activeArea = e.properties.sovereignt;
        var _config = this._config;
        var _dataset_ref = this._dataset_ref;
        var country = this.activeArea;
        var time = this.activeTime;
        var getAvailableData = this.getAvailableData;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
    };
    rtVis.prototype.dropdownClick = function (e) {
        this.activeArea = e.params.data.text;
        var _config = this._config;
        var _dataset_ref = this._dataset_ref;
        var country = this.activeArea;
        var time = this.activeTime;
        var getAvailableData = this.getAvailableData;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
        d3.select('#select2-dropdown-container-container').text(this.activeArea);
    };
    rtVis.prototype.sourceSelectClick = function (e) {
        this.activeSource = d3.select('#source-select :checked').text();
        var _config = this._config;
        var _dataset_ref = this._dataset_ref;
        var country = this.activeArea;
        var time = this.activeTime;
        var getAvailableData = this.getAvailableData;
        var runDate = this.runDate;
        var activeSource = this.activeSource;
        this._requiredData.then(function (data) {
            var t = new ts(_config);
            t.plotAllTs(country, time, data[0], activeSource, runDate);
        });
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
var setup = (function (_super) {
    __extends(setup, _super);
    function setup(x) {
        return _super.call(this, x) || this;
    }
    setup.prototype.setupLayout = function (root_element, eventHandlersRef) {
        d3.select(root_element)
            .append('div')
            .attr('class', 'map-container')
            .attr('id', 'map-container');
        d3.select('#map-container')
            .append('div')
            .attr('class', 'dropdown-container')
            .attr('id', 'dropdown-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'country-title-container')
            .attr('id', 'country-title-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'r0-title-container')
            .attr('id', 'r0-title-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'r0-ts-container')
            .attr('id', 'r0-ts-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'cases-infection-title-container')
            .attr('id', 'cases-infection-title-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'cases-infection-ts-container')
            .attr('id', 'cases-infection-ts-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'cases-report-title-container')
            .attr('id', 'cases-report-title-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'cases-report-ts-container')
            .attr('id', 'cases-report-ts-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'controls-container')
            .attr('id', 'controls-container');
        d3.select(root_element)
            .append('div')
            .attr('class', 'footer');
        d3.select(root_element)
            .append('div')
            .attr('class', 'download-container')
            .attr('id', 'download-container');
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
            .style('width', '12px')
            .style('height', '12px')
            .attr('class', 'ts-legend-e');
        d3.select('#controls-container-legend')
            .append('div')
            .text('Estimate')
            .attr('class', 'ts-legend-text');
        d3.select('#controls-container-legend')
            .append('div')
            .style('width', '12px')
            .style('height', '12px')
            .attr('class', 'ts-legend-eb');
        d3.select('#controls-container-legend')
            .append('div')
            .text('Estimate based on partial data')
            .attr('class', 'ts-legend-text');
        d3.select('#controls-container-legend')
            .append('div')
            .style('width', '12px')
            .style('height', '12px')
            .attr('class', 'ts-legend-f');
        d3.select('#controls-container-legend')
            .append('div')
            .text('Forecast')
            .attr('class', 'ts-legend-text');
        d3.select('#controls-container-time')
            .append('button')
            .attr('class', 'control-button')
            .attr('id', 'control-allday')
            .text('All')
            .on('click', eventHandlersRef['timeAllButtonClick']);
        this.addButtonSpacer('#controls-container-time');
        d3.select('#controls-container-time')
            .append('button')
            .attr('class', 'control-button')
            .attr('id', 'control-30day')
            .text('Previous Month')
            .on('click', eventHandlersRef['time30ButtonClick']);
        this.addButtonSpacer('#controls-container-time');
        d3.select('#controls-container-time')
            .append('button')
            .attr('class', 'control-button')
            .attr('id', 'control-7day')
            .text('Previous 2 weeks')
            .on('click', eventHandlersRef['time14ButtonClick']);
        this.addButtonSpacer('#controls-container-time');
        d3.select('#controls-container-time')
            .append('button')
            .attr('class', 'control-button')
            .attr('id', 'control-5day')
            .text('Previous 7 Days')
            .on('click', eventHandlersRef['time7ButtonClick']);
        d3.select('#download-container')
            .append('div')
            .text('Download data:');
        this.addButtonSpacer('#download-container');
        d3.select('#download-container')
            .append('a')
            .attr('class', 'download-button')
            .attr('id', 'download-r0')
            .text('R')
            .attr('href', this.r0Url)
            .attr('target', '_blank');
        this.addButtonSpacer('#download-container');
        d3.select('#download-container')
            .append('a')
            .attr('class', 'download-button')
            .attr('id', 'download-casesInfection')
            .text('Cases by date of infection')
            .attr('href', this.casesInfectionUrl)
            .attr('target', '_blank');
        this.addButtonSpacer('#download-container');
        d3.select('#download-container')
            .append('a')
            .attr('class', 'download-button')
            .attr('id', 'download-casesReport')
            .text('Cases by date of report')
            .attr('href', this.casesReportUrl)
            .attr('target', '_blank');
    };
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
    setup.prototype.setupControls = function (root_element, eventHandlersRef) {
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
            .attr('class', 'legend-e')
            .attr('id', 'legend-e');
        d3.select('#controls-container-legend')
            .append('div')
            .attr('class', 'legend-eb')
            .attr('id', 'legend-eb');
        d3.select('#controls-container-legend')
            .append('div')
            .attr('class', 'legend-f')
            .attr('id', 'legend-f');
        d3.select('#legend-e')
            .append('div')
            .style('width', '12px')
            .style('height', '12px')
            .attr('class', 'ts-legend-e');
        d3.select('#legend-e')
            .append('div')
            .text('Estimate')
            .attr('class', 'ts-legend-text');
        d3.select('#legend-eb')
            .append('div')
            .style('width', '12px')
            .style('height', '12px')
            .attr('class', 'ts-legend-eb');
        d3.select('#legend-eb')
            .append('div')
            .text('Estimate based on partial data')
            .attr('class', 'ts-legend-text');
        d3.select('#legend-f')
            .append('div')
            .style('width', '12px')
            .style('height', '12px')
            .attr('class', 'ts-legend-f');
        d3.select('#legend-f')
            .append('div')
            .text('Forecast')
            .attr('class', 'ts-legend-text');
        d3.select('#controls-container-time')
            .append('button')
            .attr('class', 'control-button')
            .attr('id', 'control-allday')
            .text('All')
            .on('click', eventHandlersRef['timeAllButtonClick']);
        this.addButtonSpacer('#controls-container-time');
        d3.select('#controls-container-time')
            .append('button')
            .attr('class', 'control-button')
            .attr('id', 'control-30day')
            .text('Previous Month')
            .on('click', eventHandlersRef['time30ButtonClick']);
        this.addButtonSpacer('#controls-container-time');
        d3.select('#controls-container-time')
            .append('button')
            .attr('class', 'control-button')
            .attr('id', 'control-7day')
            .text('Previous 2 weeks')
            .on('click', eventHandlersRef['time14ButtonClick']);
        this.addButtonSpacer('#controls-container-time');
        d3.select('#controls-container-time')
            .append('button')
            .attr('class', 'control-button')
            .attr('id', 'control-5day')
            .text('Previous 7 Days')
            .on('click', eventHandlersRef['time7ButtonClick']);
        d3.select('#download-container')
            .append('div')
            .text('Download data:');
        this.addButtonSpacer('#download-container');
        d3.select('#download-container')
            .append('a')
            .attr('class', 'download-button')
            .attr('id', 'download-r0')
            .text('R')
            .attr('href', this.r0Url)
            .attr('target', '_blank');
        this.addButtonSpacer('#download-container');
        d3.select('#download-container')
            .append('a')
            .attr('class', 'download-button')
            .attr('id', 'download-casesInfection')
            .text('Cases by date of infection')
            .attr('href', this.casesInfectionUrl)
            .attr('target', '_blank');
        this.addButtonSpacer('#download-container');
        d3.select('#download-container')
            .append('a')
            .attr('class', 'download-button')
            .attr('id', 'download-casesReport')
            .text('Cases by date of report')
            .attr('href', this.casesReportUrl)
            .attr('target', '_blank');
    };
    setup.prototype.setupFooter = function (root_element) {
        d3.select(root_element)
            .append('div')
            .attr('class', 'footer');
    };
    setup.prototype.addSourceSelect = function (root_element, id, elements, eventhandler) {
        var div = d3.select(root_element)
            .append('select')
            .attr('class', id)
            .attr('id', id)
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
    map.prototype.setupMap = function (geoData, summaryData, mapClick, dropdownClick) {
        var map_svg = d3.select("#map-container")
            .append('svg')
            .attr('class', 'map-svg')
            .style("width", '100%')
            .style("height", '100%');
        var map_svg_dims = document.getElementById('map-container').getBoundingClientRect();
        var projection = d3.geoCylindricalStereographic();
        var path = d3.geoPath().projection(projection);
        var scaleCenter = this.calculateScaleCenter(geoData, map_svg_dims.width, map_svg_dims.height, path);
        var projection = d3.geoCylindricalStereographic()
            .translate([map_svg_dims.width / 2, map_svg_dims.height / 2])
            .scale(scaleCenter.scale)
            .center(scaleCenter.center);
        var path = d3.geoPath().projection(projection);
        var colour_ref = { 'Decreasing': '#1170aa',
            'Likely decreasing': '#5fa2ce',
            'Unsure': '#7b848f',
            'Likely increasing': '#fd9e49',
            'Increasing': '#e75f00',
            'No Data': 'lightgray' };
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
                return summaryData.filter(function (a) { return a['Country'] == d.properties.sovereignt; })[0]['Expected change in daily cases'];
            }
            catch (_a) {
                return 'No Data';
            }
            ;
        })
            .attr("country-name", function (d) { return d.properties.sovereignt; })
            .attr("fill", function (d) { return colour_ref[d3.select(this).attr('summary')]; })
            .on("mouseover", this.mapMouseIn)
            .on("mouseout", this.mapMouseOut)
            .on('click', mapClick)
            .style('stroke', 'black')
            .style('stroke-width', '0.2px')
            .style('opacity', 0)
            .transition()
            .delay(50)
            .style('opacity', 1);
        this.createLegend(map_svg, map_svg_dims, colour_ref);
        var areaNames = geoData.features.map(function (d) { return (d.properties.sovereignt); }).filter(this.onlyUnique).sort();
        $('#dropdown-container').append('.js-example-basic-single').select2({ placeholder: 'Select a country', data: areaNames }).on('select2:select', dropdownClick);
    };
    map.prototype.mapMouseIn = function (e) {
        d3.select(this)
            .style('stroke', 'black')
            .style('stroke-width', '1.5px');
    };
    map.prototype.mapMouseOut = function (e) {
        d3.select(this)
            .style('stroke', 'black')
            .style('stroke-width', '0.5px');
    };
    map.prototype.createLegend = function (map_svg, map_svg_dims, colour_ref) {
        var legend_height = 200;
        var legend_x = map_svg_dims.width / 30;
        var legend_y = map_svg_dims.height / 2;
        map_svg.append("rect")
            .attr("x", legend_x)
            .attr("y", legend_y)
            .attr("width", 185)
            .attr("height", legend_height)
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .attr('stroke-width', '0.5px')
            .attr('rx', 8);
        map_svg.append('text')
            .attr("x", legend_x + 6)
            .attr("y", legend_y + 20)
            .text('Expected change in cases')
            .style('font-size', '10pt')
            .style('font-weight', 'bold');
        var i;
        for (i = 0; i < Object.entries(colour_ref).length; i++) {
            map_svg.append("rect")
                .attr("x", legend_x + 6)
                .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 5)
                .attr("width", 12)
                .attr("height", 12)
                .attr('fill', Object.entries(colour_ref)[i][1]);
            map_svg.append('text')
                .attr("x", legend_x + 23)
                .attr("y", (legend_y + ((legend_height / 7) * (i + 1))) + 15)
                .text(Object.entries(colour_ref)[i][0])
                .style('font-size', '12');
        }
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
        rtData = rtData.filter(function (a) { return a['country'] == country; });
        try {
            cases_data = cases_data.filter(function (a) { return a['region'] == country; });
        }
        catch (_a) { }
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
        var minDate = d3.min(rtData, function (d) { return parseTime(d.date); });
        if (time === '7d') {
            minDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }
        else if (time === '14d') {
            minDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        }
        else if (time === '30d') {
            minDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }
        rtData = rtData.filter(function (a) { return parseTime(a['date']) >= minDate; });
        try {
            cases_data = cases_data.filter(function (a) { return d3.timeDay.offset(parseTime(a['date']), -1) >= minDate; });
        }
        catch (_b) { }
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
        var maxDate = d3.max(rtData, function (d) { return parseTime(d.date); });
        try {
            var cases_max = d3.max(cases_data, function (d) { return parseFloat(d.confirm); });
        }
        catch (_c) { }
        var ymax = d3.max(rtData, function (d) { return parseFloat(d.upper_90); });
        if (!r0) {
            try {
                ymax = d3.max([ymax, cases_max]);
            }
            catch (_d) { }
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
        var poly_90 = this.plotHPoly('date', 'upper_90', 'lower_90', x, y, parseTime);
        var poly_50 = this.plotHPoly('date', 'upper_50', 'lower_50', x, y, parseTime);
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
            catch (_e) { }
        }
        ts_svg.append("path")
            .datum(estimate_data)
            .attr("d", poly_90)
            .attr("class", 'poly_90_e');
        ts_svg.append("path")
            .datum(estimate_b_data)
            .attr("d", poly_90)
            .attr("class", 'poly_90_eb');
        ts_svg.append("path")
            .datum(forecast_data)
            .attr("d", poly_90)
            .attr("class", 'poly_90_f');
        ts_svg.append("path")
            .datum(estimate_data)
            .attr("d", poly_50)
            .attr("class", 'poly_50_e');
        ts_svg.append("path")
            .datum(estimate_b_data)
            .attr("d", poly_50)
            .attr("class", 'poly_50_eb');
        ts_svg.append("path")
            .datum(forecast_data)
            .attr("d", poly_50)
            .attr("class", 'poly_50_f');
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
            .attr("class", container_id + '-tooltip')
            .attr('id', container_id + '-tooltip')
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style('font-size', '9pt')
            .style('overflow', 'visible')
            .style('position', 'relative')
            .style('display', 'inline-block');
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
        function tsMouseMove() {
            var _this = this;
            d3.select('#' + container_id + '-hover-line')
                .attr('x1', d3.mouse(this)[0])
                .attr('x2', d3.mouse(this)[0]);
            var mousedata = rtData.filter(function (a) { return parseTime(a['date']).toDateString() == x.invert(d3.mouse(_this)[0]).toDateString(); });
            var tooltip_str = '<b>' + parseTime(mousedata[0]['date']).toDateString() + '</b>' +
                '<br>' +
                '50% CI: ' + parseFloat(mousedata[0]['lower_50']).toString().replace(floatFormat, ",") + ' to ' + parseFloat(mousedata[0]['upper_50']).toString().replace(floatFormat, ",") +
                '<br>' +
                '90% CI: ' + parseFloat(mousedata[0]['lower_90']).toString().replace(floatFormat, ",") + ' to ' + parseFloat(mousedata[0]['upper_90']).toString().replace(floatFormat, ",");
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
    ts.prototype.plotAllTs = function (country, time, data, activeSource, runDate) {
        if (runDate === void 0) { runDate = undefined; }
        this.tsCountryTitle(country, 'country-title-container');
        if (data['rtData'][activeSource]['obsCasesData'] !== null && data['rtData'][activeSource]['casesInfectionData'] !== null) {
            var newData = this.preprocessDataSets(country, data, activeSource);
        }
        else {
            var newData = data;
        }
        if (newData['rtData'][activeSource]['rtData'] !== null) {
            this.plotTs(newData['rtData'][activeSource]['rtData'], country, time, newData['rtData'][activeSource]['obsCasesData'], 'r0-ts-container', runDate, true);
            this.tsDataTitle('R', 'r0-title-container');
        }
        if (newData['rtData'][activeSource]['casesInfectionData'] !== null) {
            this.plotTs(newData['rtData'][activeSource]['casesInfectionData'], country, time, newData['rtData'][activeSource]['obsCasesData'], 'cases-infection-ts-container', runDate, false);
            this.tsDataTitle('Cases by date of infection', 'cases-infection-title-container');
        }
        if (newData['rtData'][activeSource]['casesReportData'] !== null) {
            this.plotTs(newData['rtData'][activeSource]['casesReportData'], country, time, newData['rtData'][activeSource]['obsCasesData'], 'cases-report-ts-container', runDate, false);
            this.tsDataTitle('Cases by date of report', 'cases-report-title-container');
        }
    };
    ts.prototype.preprocessDataSets = function (country, data, activeSource) {
        var _a;
        var parseTime = d3.timeParse("%Y-%m-%d");
        if (data['rtData'][activeSource]['rtData'] !== null) {
            var r0Data = data['rtData'][activeSource]['rtData'].filter(function (a) { return a['country'] == country; });
        }
        if (data['rtData'][activeSource]['casesInfectionData'] !== null) {
            var casesInfectionData = data['rtData'][activeSource]['casesInfectionData'].filter(function (a) { return a['country'] == country; });
        }
        if (data['rtData'][activeSource]['casesReportData'] !== null) {
            var casesReportData = data['rtData'][activeSource]['casesReportData'].filter(function (a) { return a['country'] == country; });
        }
        var casesObservedData = data['rtData'][activeSource]['obsCasesData'].filter(function (a) { return a['region'] == country; });
        var max_observed_cases = d3.max(casesObservedData, function (d) { return parseFloat(d.confirm); });
        var threshold_date = d3.min(casesInfectionData.filter(function (a) { return a['upper_90'] >= max_observed_cases * 10; }), function (d) { return parseTime(d.date); });
        if (typeof (threshold_date) !== 'undefined') {
            if (data['rtData'][activeSource]['rtData'] !== null) {
                r0Data = r0Data.filter(function (a) { return parseTime(a['date']) <= threshold_date; });
            }
            if (data['rtData'][activeSource]['casesInfectionData'] !== null) {
                casesInfectionData = casesInfectionData.filter(function (a) { return parseTime(a['date']) <= threshold_date; });
            }
            if (data['rtData'][activeSource]['casesReportData'] !== null) {
                casesReportData = casesReportData.filter(function (a) { return parseTime(a['date']) <= threshold_date; });
            }
            casesObservedData = casesObservedData.filter(function (a) { return parseTime(a['date']) <= threshold_date; });
        }
        var newData = { 'geoData': data['geoData'],
            'summaryData': data['summaryData'], 'rtData': (_a = {}, _a[activeSource] = { 'rtData': r0Data,
                'casesInfectionData': casesInfectionData,
                'casesReportData': casesReportData,
                'obsCasesData': casesObservedData }, _a)
        };
        return (newData);
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
    ts.prototype.plotHPoly = function (x, y0, y1, x_scale, y_scale, parseTime) {
        if (parseTime === void 0) { parseTime = null; }
        if (parseTime !== null) {
            var poly = d3.area()
                .x(function (d) { return x_scale(parseTime(d[x])); })
                .y0(function (d) { return y_scale(d[y0]); })
                .y1(function (d) { return y_scale(d[y1]); });
        }
        else {
            var poly = d3.area()
                .x(function (d) { return x_scale(d[x]); })
                .y0(function (d) { return y_scale(d[y0]); })
                .y1(function (d) { return y_scale(d[y1]); });
        }
        return (poly);
    };
    return ts;
}(rtVis));
;
//# sourceMappingURL=build.js.map