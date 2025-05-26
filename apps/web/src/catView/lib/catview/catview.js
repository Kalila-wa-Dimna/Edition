/*
 The MIT License (MIT)

 Copyright (c) 2015 and ongoing Marcus Pöckelmann

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/

// CATview - the Colored & Aligned Texts view - version 2.6.3
 const CATview = new function() {
  this.debug = false;

  // initialize attributes
  this.initialize = function(_orientation, _x_inverted, _y_inverted){
    if(CATview.debug)
      console.log('CATview.initialize');

    CATview.version = '2.6.4';

    // id of the parent container that will include CATview
    CATview.parent_id = 'CATview';

    // function that will be called when a rectangle was clicked (wit, edge passed as argument)
    CATview.click_on_edge_callback = null;

    // basic svg settings
    CATview.svg = null;
    CATview.width_svg = document.getElementById('CATview').offsetWidth;
    CATview.height_svg = document.getElementById('CATview').offsetHeight;

    // CATviews orientation
    CATview.orientation = ['left', 'right', 'bottom'].indexOf(_orientation) === -1 ? 'top' : _orientation;
    CATview.vertical = (CATview.orientation === 'left' || CATview.orientation === 'right');
    CATview.x_inverted = (typeof _x_inverted === 'undefined') ? false : _x_inverted;  // setting: default order of edges (false → left/top, true → right/bottom)
    CATview.y_inverted = (typeof _y_inverted === 'undefined') ? false : _y_inverted;  // setting: default order of witnesses (false → top/left, true → bottom/right)

    // content settings
    CATview.content = null;
    CATview.space_for_egdes_axis = 24;   // reserved drawing size of the edges axis
    CATview.space_for_names_axis = 0;       // reserved drawing size of the name axis (calculated in respect to the actual names in .draw_svg)
    CATview.extra_space_for_names_axis = 4; // some extra reserved space for the names axis
    CATview.space_for_tool_icons = 22;   // reserved drawing size for tool icons
    CATview.space_for_other = 2;         // reserved size opposite to the edges axis
    CATview.margin = {left: 0, top: 0, right: 0, bottom: 0};
    CATview.width_content = null;
    CATview.height_content = null;
    CATview.edgesAxis = null;
    CATview.edge_name = null;            // current name to display
    CATview.edge_name_enabled = true;    // set to false to disable the display the name of an edge on hovering
    CATview.font_size_x = 10;
    CATview.font_size_y = 14;
    CATview.rect_width = null;
    CATview.rect_height = null;
    CATview.rect_h_margin = null;
    CATview.rect_v_margin = null;
    CATview.rect_stroke = null;
    CATview.rect_border = "stroke: #2f2f86;";
    CATview.enable_scroll_spy = true;
    CATview.scroll_spy_pos = 1;   // default position of the scroll spy
    CATview.display_extra_segments = true;      // setting: should extra_segments be displayed
    CATview.search_mode = 'seg';       // setting: highlight search results for full columns ('col' )or individual segments ('seg')
    CATview.tools = [];                         // pairs of font-awesome-unicodes and callbacks

    CATview.brush = null;
    CATview.display_brush = false;
    CATview.brush_from_edge = -1;
    CATview.brush_to_edge = -1;
    CATview.brush_range = 1;
    CATview.brush_from_name = -1;
    CATview.brush_to_name = -1;
    CATview.brush_callback = null;
    CATview.brush_end_callback = null;
    CATview.brush_offset_from = -0.5;
    CATview.brush_offset_to = 0.5;

    // zooming parameters
    CATview.zoom = null;    // the d3 object for zooming
    CATview.from = 1;      // positions of edges to display
    CATview.to = 1;
    CATview.from_pixel = 0;      // pixel-position in scale_edges_original of edges to display
    CATview.to_pixel = 0;
    CATview.scale = 1;     // current zooming factor
    CATview.translate = 0; // current translation for zoomed-in excerpt
    CATview.zoom_step = 0.25; // steps by which to increase/decrease zoom in zoom_in/_out()
    CATview.zoom_button_clicked = false;

    // data
    CATview.names = [];     // array with witnesses names (number of rows)
    CATview.edges = [];     // array with alignment edges (number of columns) - contains an array for each column (edge) with an entry for each column (witness), i.e.
                            //  -1: no segment for the witness
                            //  value within [0.0, 1.0]: segment, which will be colored according to CATview.scale_color
    CATview.search_results = [];  // array with column ids to be highlighted as search results
    CATview.extra_segments = [];  // additional segments that will be displayed in a faded out fashion (gray dotted without filling)
                                  //  entries are triples with [index of edge, index of witness, color value (within [0.0, 1.0])]
    CATview.edge_names = [];      // array of the edges' names, displayed on mouse over

    // scales to map the elements to the available pixels
    CATview.scale_edges = null;   // map [from, to]
    CATview.scale_names = null;   // map the names
    CATview.scale_edges_original = null;  // map [0, n-1]
    // a scale for the color
    CATview.scale_color = d3.scaleLinear().domain([0, 1]).range(["#C1C1E9", "#0000A3"]);
    CATview.equality_color = '#d9d9d9';
    CATview.use_equality_color = true;

    // for scaling of rectangles
    CATview.rect_scaling_enabled = false;   // if true, use CATview.rect_scaling to define the size for all rectangles
    CATview.rect_scaling_minimum = 0.2;     // defines the smallest possible size for a rectangle
    CATview.rect_scaling_mode = 'default';  // defines the placement after scaling: 'default' (on bottom) | 'middle' (centered) | 'inverted' (on top)
    CATview.rect_scaling = null;            // same structure as edges - defines the size of rectangles

    // linking of rectangles - highlights linked rectangles on mouse hover by color
    CATview.rect_linking_enabled = false;
    CATview.rect_linking_data = null;       // an array with groups of linked rectangles identified by their data-segment-index attribute, e.g.
                                            // [ ['19_0', '16_0'], ['25_1', '26_1', '27_1'] ]
                                            // (link two segments for the first witness; and three segments for the second)

    CATview.drag_enabled = false;    // is drag'n'drop allowed
    CATview.drag_callback = null;   // called after a successful name swap
    CATview.drag_names_order = null;
    // the current order of names (might differ from the original order due to drag'n'drop)
    CATview.drag_order_name2pos = null; // array that maps: name index → position index
    // some helper variables across the events
    CATview.drag_axis_attr = CATview.vertical? "x" : "y";
    CATview.drag_positions = [];
    CATview.drag_old_pos = null;
    CATview.drag_new_pos = null;
    CATview.drag_do_end = false;
    CATview.drag_threshold = 0.1;
    CATview.drag_mode = 'insert';  // 'insert' || 'swap'
  };

  // method to set margins and content width/height according to the current orientation of CATview and its axis
  this.set_margins = function(){
    if(CATview.debug)
      console.log('CATview.set_margins');

    if(CATview.vertical){
      // handle place of names axis and tool icons in respect to the edges axis direction for vertical orientation of CATview
      CATview.margin.top = CATview.x_inverted ? CATview.space_for_tool_icons : CATview.space_for_names_axis;
      CATview.margin.bottom = CATview.x_inverted ? CATview.space_for_names_axis : CATview.space_for_tool_icons;
      // handle place of the edges axis according to the (left or right) orientation of CATview
      CATview.margin.left = CATview.orientation === 'left' ? CATview.space_for_other : CATview.space_for_egdes_axis;
      CATview.margin.right = CATview.orientation === 'left' ? CATview.space_for_egdes_axis : CATview.space_for_other;
    } else {
      // handle place of the edges axis according to the (top or bottom) orientation of CATview
      CATview.margin.top = CATview.orientation === 'top' ? CATview.space_for_other : CATview.space_for_egdes_axis;
      CATview.margin.bottom = CATview.orientation === 'top' ? CATview.space_for_egdes_axis : CATview.space_for_other;
      // handle place of names axis and tool icons in respect to the edges axis direction for horizontal orientation of CATview
      CATview.margin.left = CATview.x_inverted ? CATview.space_for_tool_icons : CATview.space_for_names_axis;
      CATview.margin.right = CATview.x_inverted ? CATview.space_for_names_axis : CATview.space_for_tool_icons;
    }

    // set the available width and height for the content in respect to the margin
    CATview.width_content   = CATview.width_svg - CATview.margin.left - CATview.margin.right;
    CATview.height_content  = CATview.height_svg - CATview.margin.top - CATview.margin.bottom;
  };
  // methods to set scales according to the current orientation of CATview and its axis
  this.set_scale_edges = function(_from, _to){
    if(CATview.debug)
      console.log('CATview.set_scale_edges');

    if(CATview.vertical){
      // vertical orientation (left, right)
      if(CATview.x_inverted){
        // inverted edges axis (starting bottom)
        CATview.scale_edges = d3.scaleLinear().domain([_from, _to]).range([CATview.height_content, 0]);
      } else {
        // normal edges axis (starting top)
        CATview.scale_edges = d3.scaleLinear().domain([_from, _to]).range([0, CATview.height_content]);
      }
    } else {
      // horizontal orientation (top, bottom)
      if(CATview.x_inverted){
        // inverted edges axis (starting right)
        CATview.scale_edges = d3.scaleLinear().domain([_from, _to]).range([CATview.width_content, 0]);
      } else {
        // normal edges axis (starting left)
        CATview.scale_edges = d3.scaleLinear().domain([_from, _to]).range([0, CATview.width_content]);
      }
    }
  };
  this.set_scale_names = function(){
    if(CATview.debug)
      console.log('CATview.set_scale_names');

    if(CATview.vertical){
      // vertical orientation (left, right)
      if(CATview.y_inverted){
        // inverted names axis (starting right)
        CATview.scale_names = d3.scaleLinear().domain([-0.5, CATview.names.length - 0.5]).range([CATview.width_content, 0]);
      } else {
        // normal names axis (starting left)
        CATview.scale_names = d3.scaleLinear().domain([-0.5, CATview.names.length - 0.5]).range([0, CATview.width_content]);
      }
    } else {
      // horizontal orientation (top, bottom)
      if(CATview.y_inverted){
        // inverted names axis (starting bottom)
        CATview.scale_names = d3.scaleLinear().domain([-0.5, CATview.names.length - 0.5]).range([CATview.height_content, 0]);
      } else {
        // normal names axis (starting top)
        CATview.scale_names = d3.scaleLinear().domain([-0.5, CATview.names.length - 0.5]).range([0, CATview.height_content]);
      }
    }
  };

  // query new data from the server and call draw_svg
  // this requires jQuery
  this.server_update = function (_url, _callback){
    if(CATview.debug)
      console.log('CATview.server_update');

    $.ajax({type: 'get', url: _url, dataType: 'json'}).done(function (data) {
      if(CATview.debug)
        console.log(data);
      CATview.names = data.names;
      // default order of names
      CATview.drag_order_name2pos = [];
      for(let i = 0; i < CATview.names.length; i++){
        CATview.drag_order_name2pos.push(i);
      }

      CATview.edges = data.edges;
      CATview.edge_names = data.edge_names;
      CATview.extra_segments = data.extra_segments;
      CATview.rect_linking_data = data.rect_linking_data;
      CATview.rect_scaling = data.rect_scaling;

    }).done(function() {
      // todo check whether the data is valid
      CATview.scale = 1;      // current zooming factor
      CATview.translate = 0;  // current translation for zoomed-in excerpt
      CATview.draw_svg();
      if (_callback) {
        _callback();
      }
    });
  };

  // slight change of the data
  // TOOD search_results, extra_segments, edge_names, rect_scaling, rect_linking_data
  // Auch bei geänderter Reihenfolge der names!
  this.data_change = function(changes){
    if(CATview.debug)
      console.log('CATview.data_change');

    if(CATview.content) {
      // changes should be an array with entries in the following form
      //  ['replace', col, edge]
      //  ['insert', col, edge]
      //  ['remove', col]
      // where 'col' is the index of the column and 'edge' the change information, i.e. an array with color values for each row at this col
      if (!(Object.prototype.toString.call( changes ) === '[object Array]'))    // changes could be a string if passed from Rails
        changes = eval(changes);
      if (Object.prototype.toString.call( changes ) === '[object Array]') {
        for (let i = 0; i < changes.length; i++) {
          // todo check the data types
          // todo search_results on replace (keyword needed)
          // todo remaining_edges (insert, remove)
          let type = changes[i][0];
          let col = changes[i][1];
          let edge = changes[i][2][0]
          //console.log(type + ' ' + col);
          //console.log(changes[i][2] );
          switch (type) {
            case 'replace':
              CATview.edges[col] = edge;
              // update the extra_segments
              for (let j = CATview.extra_segments.length - 1; j >= 0; j--) {
                if (CATview.extra_segments[j][0] === col && edge[CATview.extra_segments[j][1]] !== -1){
                  // extra segment will be deleted
                  // prior update corresponding rect linking, e.g. [ ['19_0', '16_0'], ['25_1', '26_1', '27_1'] ]
                  // TODO kann nicht mit Verschiebung umgehen!
                  for (let jj = CATview.rect_linking_data.length - 1; jj >= 0; jj--) {
                    for (let k = CATview.rect_linking_data[jj].length - 1; k >= 0; k--) {
                      if (CATview.rect_linking_data[jj][k] === '' + col + '_' + CATview.extra_segments[j][1] ) {
                        CATview.rect_linking_data[jj].splice(k, 1);
                      }
                    }
                    if(CATview.rect_linking_data[jj].length <= 1)
                      CATview.rect_linking_data.splice(jj, 1);
                  }
                  // and delete the extra segment
                  CATview.extra_segments.splice(j, 1);

                }
              }
              // TODO update the rect_scaling
              break;
            case 'insert':
              CATview.edges.splice(col, 0, edge);
              // update the search results
              for (let j = 0; j < CATview.search_results.length; j++) {
                if (CATview.search_results[j][0] > col)
                  CATview.search_results[j][0] += 1;
              }
              // update the extra_segments
              for (let j = 0; j < CATview.extra_segments.length; j++) {
                if (CATview.extra_segments[j][0] > col)
                  CATview.extra_segments[j][0] += 1;
              }
              // update the rect_linking_data, e.g. [ ['19_0', '16_0'], ['25_1', '26_1', '27_1'] ]
              for (let j = 0; j < CATview.rect_linking_data.length; j++) {
                for (let k = 0; k < CATview.rect_linking_data[j].length; k++) {
                  let pos = CATview.rect_linking_data[j][k].split('_') // [col, wit]
                  let _col = parseInt(pos[0])
                  if(_col > col){
                    CATview.rect_linking_data[j][k] = '' + (_col + 1 ) + '_' + pos[1]
                  }
                }
              }
              // update the edge_names
              CATview.edge_names.splice(col, 0, '');
              // TODO update the rect_scaling
              // TODO update the brush if displayed
              break;
            case 'remove':
              CATview.edges.splice(col, 1);
              // update the search results
              for (let j = CATview.search_results.length - 1; j >= 0; j--) {
                if (CATview.search_results[j][0] > col)
                  CATview.search_results[j][0] -= 1;
                else if (CATview.search_results[j][0] === col)
                  CATview.search_results.splice(j, 1);
              }
              // update the extra_segments
              for (let j = CATview.extra_segments.length - 1; j >= 0; j--) {
                if (CATview.extra_segments[j][0] > col)
                  CATview.extra_segments[j][0] -= 1;
                else if (CATview.extra_segments[j][0] === col)
                  CATview.extra_segments.splice(j, 1);
              }
              // update the rect_linking_data, e.g. [ ['19_0', '16_0'], ['25_1', '26_1', '27_1'] ]
              for (let j = CATview.rect_linking_data.length - 1; j >= 0; j--) {
                for (let k = CATview.rect_linking_data[j].length - 1; k >= 0; k--) {
                  let pos = CATview.rect_linking_data[j][k].split('_') // [col, wit]
                  let _col = parseInt(pos[0])
                  if(_col > col)
                    CATview.rect_linking_data[j][k] = '' + (_col - 1 ) + '_' + pos[1]
                  else if (_col === col) {
                    CATview.rect_linking_data[j].splice(k, 1);
                  }
                }
                if(CATview.rect_linking_data[j].length <= 1)
                  CATview.rect_linking_data.splice(j, 1);
              }
              // update the edge_names
              CATview.edge_names.splice(col, 1);
              // TODO update the rect_scaling
              // TODO update the brush if displayed
              break;
            default:
              console.log('CATview.data_change: unknown kind of change (' + changes[i][0] + ')');
              break;
          }
        }

        CATview.set_scale_edges(0, CATview.edges.length + 1);
        CATview.scale_edges_original = CATview.scale_edges.copy();
        CATview.refresh_content(CATview.from, CATview.to);
        return true;
      }
      else
        return false;
    }
    else
      return false;
  };

  // draw the initial svg that contains CATview and call refresh_content
  this.draw_svg = function () {
    if(CATview.debug)
      console.log('CATview.draw_svg');

    // remove previous content and add the svg-element to the parent
    document.getElementById(CATview.parent_id).innerHTML = '';
    CATview.svg = d3.select('#' + CATview.parent_id).insert("svg", ":first-child").attr('width', CATview.width_svg).attr('height', CATview.height_svg);

    // determine the necessary padding before the names-axis in respect to the names
    let names_offset = 0;
    if(CATview.names.length > 0){
      CATview.svg.append("g")
        .attr('id', 'CATview_prerendered_names')
        .selectAll("text")
        .data(CATview.names)
        .enter().append("text")
        .text(function (d) {return d})
        .attr('font-size', CATview.font_size_y);
      // get the dimension of the longest text and add 2 pixels padding
      let names = document.querySelectorAll('#CATview_prerendered_names text');
      for(let i = 0; i < names.length; i++){
        if(names_offset < names[i].getComputedTextLength())
          names_offset = names[i].getComputedTextLength();
      }
      CATview.space_for_names_axis = names_offset + CATview.extra_space_for_names_axis;
      //// than remove this temporary elements
      let element = document.getElementById('CATview_prerendered_names');
      element.parentNode.removeChild(element);
    }

    // initialize margins as well as width and height for the content
    CATview.set_margins();

    // initialize the scales
    CATview.set_scale_edges(0, CATview.edges.length + 1)
    CATview.scale_edges_original = CATview.scale_edges.copy();
    CATview.set_scale_names();

    // add some zebra stripes
    CATview.svg.append("g").attr("class", "zebra");
    CATview.draw_zebra_stripes();

    // add the names-axis
    if(CATview.drag_enabled)
      CATview.svg.append("g").attr("class", "axis names-axis draggable");
    else
      CATview.svg.append("g").attr("class", "axis names-axis");
    CATview.draw_names_axis();

    // add the group of tool icons
    CATview.svg.append("g").attr("class", "tool-icons");
    CATview.draw_tool_icons();

    // add a group for the content and its zoom behavior
    CATview.content = CATview.svg.append("g")
      .attr("class", "content")
      .attr("transform", "translate(" + CATview.margin.left + "," + CATview.margin.top + ")");

    // add the zooming behavior
    CATview.zoom = d3.zoom().on("zoom", CATview.zooming);
    CATview.set_max_zoom();
    CATview.content.call(CATview.zoom);

    // the zoom needs an element over the contents' complete size
    CATview.content.append('rect')
      .attr('width', CATview.width_content)
      .attr('height', CATview.height_content)
      .attr('style', 'fill-opacity: 0.0;');

    // add the edges-axis
    CATview.content.append("g").attr("class", "axis edges-axis");
    CATview.draw_edges_axis();

    // add containers for different groups of content
    CATview.content.append("g").attr("class", "search_results_background");
    CATview.content.append("g").attr("class", "alignment");
    //CATview.content.append("g").attr("class", "brush");

    // set default interval of data to be shown and draw the content
    CATview.from_pixel = 0;
    CATview.to_pixel = CATview.vertical === true ? CATview.height_content : CATview.width_content;
    CATview.refresh_content(1, CATview.edges.length);

    // append the brush, if it was enabled prior the call of draw_svg
    CATview.draw_brush();

    // append box to display an edges name on hover
    CATview.edge_name = d3.select("#CATview").append("div").attr("class", "edge-name" + " edge-name-" + CATview.orientation);
  };

  // define the interval of edges and refresh the content afterwards
  this.refresh_content = function(_from, _to){
    if(CATview.debug)
      console.log('CATview.refresh_content(' + _from + ', ' + _to + ')');

    if(_from === undefined && CATview.from === null)
      _from = 1;
    if(_to === undefined && CATview.to === null)
      _to = CATview.edges.length;

    if(CATview.content){
      if (_from !== null && _from !== undefined) CATview.from = parseInt(_from);
      if (CATview.from < 1) CATview.from = 1;
      if (_to !== null &&_to !== undefined) CATview.to = parseInt(_to);
      if (CATview.to > CATview.edges.length) CATview.to = CATview.edges.length;
      // refresh the edges-scale (with one bin offset)
      CATview.set_scale_edges(Math.max(CATview.from - 1, 0), Math.min(CATview.to + 1, CATview.edges.length + 1));

      CATview.draw_alignment();
      CATview.draw_extra_segments();
      CATview.draw_search_results();
      if(CATview.enable_scroll_spy)
        CATview.draw_scroll_spy();
    }
    else
      return false;
  };

  // draw the axis
  this.draw_edges_axis = function(){
    if(CATview.debug)
      console.log('CATview.draw_edges_axis');

    let edges_axis = CATview.svg.select(".edges-axis");
    edges_axis.selectAll('*').remove(); // remove the current content

    let pos_x = 0;
    let pos_y = 0;
    switch(CATview.orientation) {
      case 'left':
        CATview.edgesAxis = d3.axisRight(CATview.scale_edges);
        pos_x = CATview.width_content;
        break;
      case 'right':
        CATview.edgesAxis = d3.axisLeft(CATview.scale_edges);
        break;
      case 'bottom':
        CATview.edgesAxis = d3.axisTop(CATview.scale_edges);
        break;
      default:
        // numbers of edges at the bottom for top orientation of CATview
        CATview.edgesAxis = d3.axisBottom(CATview.scale_edges);
        pos_y = CATview.height_content;
    }
    edges_axis
      .attr("transform", "translate(" + pos_x + "," + pos_y + ")")
      .call(CATview.edgesAxis);
  };
  this.draw_names_axis = function(){
    if(CATview.debug)
      console.log('CATview.draw_names_axis');

    let names_axis = CATview.svg.select(".names-axis");
    names_axis.selectAll('*').remove(); // remove the current content

    // place the names axis
    if(CATview.x_inverted)
      if(CATview.vertical)
        names_axis.attr("transform", "translate(" + CATview.margin.left + ", " + (CATview.height_svg - CATview.margin.bottom) + ")");
      else
        names_axis.attr("transform", "translate(" + (CATview.width_svg - CATview.margin.right) + ", " + CATview.margin.top + ")");
    else
      names_axis.attr("transform", "translate(" + CATview.margin.left + ", " + CATview.margin.top + ")");

    // default names order (may not initialised yet or number of names are not up-to-date)
    if(CATview.drag_order_name2pos === null || CATview.drag_order_name2pos.length != CATview.names.length){
      CATview.drag_order_name2pos = [];
      for(let i = 0; i < CATview.names.length; i++){
        CATview.drag_order_name2pos.push(i);
      }
    }

    // add the names
    let anchor = 'end';
    if(CATview.vertical){
      if((CATview.orientation === 'left' && CATview.x_inverted) || (CATview.orientation === 'right' && !CATview.x_inverted))
        anchor = 'start';
      names_axis.selectAll("text")
        .data(CATview.names)
        .enter().append("text")
        .text(function (d) {return d})
        .attr("x", function(d, i) {return CATview.scale_names(CATview.drag_order_name2pos[i])})
        .attr("original", function(d, i) {return i})
        .attr("current", function(d, i) {return CATview.drag_order_name2pos[i]})
        .attr("style", "text-anchor: " + anchor + ";")
        .attr('font-size', CATview.font_size_y)
        .attr("transform", function(d, i) {
          // rotate for 90 degrees than move the names a bit to the right to make them centered
          return 'rotate(' + (CATview.orientation === 'left' ? 90 : -90) + ', ' + CATview.scale_names(CATview.drag_order_name2pos[i]) + ', 0)translate(0,' + (CATview.font_size_y/2) + ')';
        });
    } else {
      if(CATview.x_inverted)
        anchor = 'start';
      names_axis.selectAll("text")
        .data(CATview.names)
        .enter().append("text")
        .text(function (d) {return d})
        .attr("y", function(d, i) {return CATview.scale_names(CATview.drag_order_name2pos[i]) + 5 }) // a little offset due to font size
        .attr("original", function(d, i) {return i})
        .attr("current", function(d, i) {return CATview.drag_order_name2pos[i]})
        .attr("style", "text-anchor: " + anchor + ";")
        .attr('font-size', CATview.font_size_y);
    }

    // enable drag'n'drop of names (and their associated edges)
    if(CATview.drag_enabled){
      // which axis the draggable names are placed
      CATview.drag_axis_attr = CATview.vertical? "x" : "y";
      // get the valid positions from dragging names
      CATview.drag_positions = [];
      d3.selectAll("g.axis.names-axis>text").each(function(d,i) { CATview.drag_positions.push( parseFloat(d3.select(this).attr(CATview.drag_axis_attr)));});
      // and sort them in ascending order
      CATview.drag_positions.sort(function(a, b){ return a-b; });

      // define the drag events
      var drag_handler = d3.drag()
        .on("start", function(){
          let drag_object = d3.select(this);
          CATview.drag_old_pos = parseInt(drag_object.attr('current'));

          d3.select("g.axis.names-axis")
            .append("text")
            .text(drag_object.text())
            .attr("id", "ghost")
            .style("visibility", "hidden")
            .style("opacity", 0.5)
            .style("text-anchor", "middle")
            .attr("transform", "rotate("+(CATview.orientation === "left"? "90" : CATview.orientation === "right"? "-90" : "0") + ")" );

        })
        .on("drag", function(d){
          // track the current grabbed name label
          d3.select("#ghost")
            .style("visibility", "visible")
            .style("cursor", "grabbing")
            .attr("x", d3.event.x)
            .attr("y", d3.event.y);

          if (!CATview.vertical){
            d3.select("#ghost")
              .style("visibility", "visible")
              .style("cursor", "grabbing")
              .attr("x", d3.event.x)
              .attr("y", d3.event.y);
          }
          else {
            if (CATview.orientation === "left"){
              d3.select("#ghost")
                .style("visibility", "visible")
                .style("cursor", "grabbing")
                .attr("x", d3.event.y)
                .attr("y", (-1)*d3.event.x);
            }
            else {
              d3.select("#ghost")
                .style("visibility", "visible")
                .style("cursor", "grabbing")
                .attr("x", (-1)*d3.event.y)
                .attr("y", d3.event.x);
            }
          }

          // if current mouse pos differs enough from valid pos, then choose
          // the nearest neighbour and switch positions with it if there is a neighbour
          if (Math.abs((CATview.vertical? d3.event.x : d3.event.y) - CATview.drag_positions[CATview.drag_old_pos]) >
            CATview.drag_threshold * Math.abs(CATview.drag_positions[0]-CATview.drag_positions[1])){
            // only when the attributes here have been updated, we should do a drag-end event.
            // if not, this results in an error when double clicking on an element, after a first
            // drag has been applied
            CATview.drag_do_end = true;

            // we don't need the direction, we just need to identify the position of the dragged element
            // with the one with the closest coordinates to the mouse cursor

            // select the element with the closest y to current mouse position
            // for this calculate all differences of the valid positions to the mouse cursor
            // and take the index with lowest distance.
            let distances = CATview.drag_positions.map(function(el){return Math.abs(el-(CATview.vertical? d3.event.x : d3.event.y));});
            // get the index with minimal distance
            let minimum = Math.min(...distances); // ... → translates the array to a list of values
            let idx_min = distances.indexOf(minimum); // just returns first index that matches argument

            // now we can estimate the targets position
            CATview.drag_new_pos = idx_min;
          }
        })
        .on("end", function(d){
          // only swap on end of dragging!
          // swap the dragged elements and the target elements position:
          d3.select("#ghost").remove();

          if(!CATview.drag_do_end)
            return;

          let old_pos = CATview.drag_old_pos;
          let new_pos = CATview.drag_new_pos;
          let objects = {};
          // get all name objects
          for(let pos = 0; pos < CATview.names.length; pos++){
            objects[pos] = d3.select("g.axis.names-axis>text[current=\"" + pos + "\"]");
          }

          // collects all information necessary to move the names (and their associated segments)
          let names_to_move = [];
          // add the dragged name
          names_to_move.push({
            'object': objects[old_pos],
            'from': old_pos,
            'to': new_pos,
            'new_position': CATview.drag_positions[new_pos], // move_pos[move_pos.length-1]
            'transform': objects[new_pos].attr("transform") // of name on target position
          });
          // add other names depending on the drag mode:
          if(CATview.drag_mode === 'swap'){
            // for swap mode → add the name at the target position
            names_to_move.push({
              'object': objects[new_pos],
              'from': new_pos,
              'to': old_pos,
              'new_position': CATview.drag_positions[old_pos],
              'transform': objects[old_pos].attr("transform") // of name on target position
            });
          }
          else{
            // for insert mode = a ring swap → add the names between the old and new position of the dragged name
            if(old_pos < new_pos){
              for (let pos = new_pos; pos > old_pos; pos--){
                names_to_move.push({
                  'object': objects[pos],
                  'from': pos,
                  'to': pos - 1,
                  'new_position': CATview.drag_positions[pos - 1],
                  'transform': objects[pos - 1].attr("transform")
                });
              }
            }
            else{ // new_pos < old_pos
              for (let pos = new_pos; pos < old_pos; pos++){
                names_to_move.push({
                  'object': objects[pos],
                  'from': pos,
                  'to': pos + 1,
                  'new_position': CATview.drag_positions[pos + 1],
                  'transform': objects[pos + 1].attr("transform")
                });
              }
            }

          }

          // perform the movment of the names and their associated segments
          names_to_move.forEach(function(name, i){
            // move the name
            name.object.transition()
              .attr(CATview.drag_axis_attr, name.new_position)
              .attr("transform", name.transform); // add transformation of the text (rotation in vertical orientation)

            // remember the new current position
            name.object.attr('current', name.to);
            // and update the names order
            let original = parseInt(name.object.attr('original'));
            CATview.drag_order_name2pos[original] = name.to;

            // console.log('  ' + name.object.text() + ': ' + name.from + ' → ' + name.to);

            // move the associated segments
            let segments = d3.selectAll("rect.rect-segment[data-segment-index$=\"_"+original+"\"],rect.search_result[data-segment-index$=\"_"+original+"\"]");
            // set the x or y attribute to the one at the position before (in move_pos)
            let add_to_source = CATview.drag_positions[name.to] - CATview.drag_positions[name.from];
            // segments can differ in height and therefore y-value (in vertical orientation)
            // so we need to add the same amount instead of setting the y value the same for all
            segments.each( function(){
              d3.select(this)
                .transition()
                .attr(CATview.drag_axis_attr, parseFloat(d3.select(this).attr(CATview.drag_axis_attr)) + add_to_source);
            });
          });

          // drag finished
          CATview.drag_do_end = false;

          if (CATview.drag_callback != null) {
            return CATview.drag_callback(old_pos, new_pos);
          }

        });

      // select the name labels and listen for drag-events
      let inner_texts = d3.selectAll("g.axis.names-axis>text");
      drag_handler(inner_texts);
    }
  };

  this.enable_drag = function(_mode){
    if(CATview.debug)
      console.log('CATview.enable_drag');

    if(_mode === 'swap')
      CATview.drag_mode = 'swap'
    else
      CATview.drag_mode = 'insert'    // default

    CATview.drag_enabled = true;

    if(CATview.svg !== null && CATview.svg.select(".names-axis").size() === 1 ){
      CATview.svg.append("g").attr("class", "axis names-axis ");
      let axis = document.querySelector('.names-axis');
      axis.classList.add('draggable');
      CATview.draw_names_axis();
    }

    return true;
  };
  this.disable_drag = function(){
    if(CATview.debug)
      console.log('CATview.disable_drag');

    CATview.drag_enabled = false;

    if(CATview.svg !== null && CATview.svg.select(".names-axis").size() === 1 ){
      CATview.svg.append("g").attr("class", "axis names-axis ");
      let axis = document.querySelector('.names-axis');
      axis.classList.remove('draggable');
      CATview.draw_names_axis();
    }

    return true;
  };
  // _name2pos = array that maps: name index → position index, e.g. [3,1,2,0] (swap first and last text)
  this.set_names_order = function(_name2pos){
    if(CATview.debug)
      console.log('CATview.set_names_order');

    // TODO validate data
    CATview.drag_order_name2pos = _name2pos;

    if(CATview.drag_enabled){
      CATview.draw_names_axis();
      CATview.refresh_content(CATview.from, CATview.to);
    }

    return true;
  };
  this.reset_names_order = function(){
    if(CATview.debug)
      console.log('CATview.reset_names_order');

    let names_order = {};
    for(let i = 0; i < CATview.names.length; i++)
      names_order[i] = i;

    return CATview.set_names_order(names_order);
  };
  // returns an array that maps: name index → position index, e.g. [3,1,2,0] (swap first and last text)
  this.get_names_order = function(){
    if(CATview.debug)
      console.log('CATview.get_names_order');

    return CATview.drag_order_name2pos;
  };
  this.set_drag_callback = function(drag_callback) {
    if(CATview.debug)
      console.log('CATview.set_drag_callback');

    CATview.drag_callback = drag_callback;
    return true;
  };
  this.toggle_drag_mode = function(){
    if(CATview.debug)
      console.log('CATview.toggle_drag_mode');

    if(CATview.drag_mode === 'insert')
      CATview.drag_mode = 'swap'
    else
      CATview.drag_mode = 'insert'

    // redraw the names axis
    CATview.draw_names_axis();

    return CATview.drag_mode;
  };

  // draws the zebra stripes (gray lines in the background for every second text)
  this.draw_zebra_stripes = function(){
    if(CATview.debug)
      console.log('CATview.draw_zebra_lines');

    let zebra = CATview.svg.select(".zebra");
    zebra.selectAll('*').remove();  // remove the current content

    let width, height;
    if(CATview.vertical){
      height = CATview.height_svg - CATview.space_for_tool_icons;
      width = Math.floor(CATview.width_content / CATview.names.length * 0.5)

    } else {
      width = CATview.width_svg - CATview.space_for_tool_icons;
      height = Math.floor(CATview.height_content / CATview.names.length * 0.5);
    }

    let offset = CATview.x_inverted ? CATview.space_for_tool_icons : 0

    zebra.selectAll("rect")
      .data(CATview.names)
      .enter().append("rect")
      .attr("class", "rect-zebra")
      .attr("width", width )
      .attr("height", height)
      .attr('x', CATview.vertical === true ? function(d, i) {return CATview.scale_names(i) - width / 2.0 + CATview.margin.left} : offset)
      .attr('y', CATview.vertical === true ? offset : function(d, i) {return CATview.scale_names(i) - height / 2.0 + CATview.margin.top})
      .attr("fill", function(d,i) { return i%2===1 ? "#e8e8e8":"transparent";})
  };

  // draws the icons for tools included in CATview.tools
  this.draw_tool_icons = function(){
    if(CATview.debug)
      console.log('CATview.draw_tool_icons');

    let toolicons = CATview.svg.select(".tool-icons");
    toolicons.selectAll('*').remove();  // remove the current content

    let margin = 3;     // extra margin around the tool icon container
    let width, height;  // available space for the tool icon container

    // place the container for the tool icons
    if(CATview.vertical === true){
      width = CATview.width_svg - CATview.margin.left - CATview.margin.right - 2 * margin;
      height = CATview.space_for_tool_icons - 2 * margin;
      if(CATview.x_inverted)
        toolicons.attr("transform", "translate(" + (CATview.margin.left + margin) + ", " + margin + ")");
      else
        toolicons.attr("transform", "translate(" + (CATview.margin.left + margin) +  ", " + (CATview.height_svg - CATview.margin.bottom + margin) + ")");
    } else {
      width = CATview.space_for_tool_icons - 2 * margin;
      height = CATview.height_svg - CATview.margin.top - CATview.margin.bottom - 2 * margin;
      if(CATview.x_inverted)
        toolicons.attr("transform", "translate(" + margin + ", " + (CATview.margin.top + margin) + ")");
      else
        toolicons.attr("transform", "translate(" + (CATview.width_svg - CATview.margin.right + margin) +  ", " + (CATview.margin.top + margin) + ")");
    }
    /*toolicons.append('rect')
      .attr("x", -margin)
      .attr("y", -margin)
      .attr("width", width + 2 * margin)
      .attr("height", height + 2 * margin)
      .attr('fill', '#ccccff');
    toolicons.append('rect')
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr('fill', '#8888ff');*/

    let n = CATview.tools.length;  // number of tool icons to be placed
    if(n > 0) {
      let padding = 12;
      let fontsize;
      if(CATview.vertical){
        fontsize = (width - (n-1)*padding) / n;
        if(height < fontsize){
          fontsize = height;
          padding = (width - n * fontsize) / (n-1)
        }
      } else {
        fontsize = (height - (n-1)*padding) / n;
        if(width < fontsize){
          fontsize = width;
          padding = (height - n * fontsize) / (n-1)
        }
      }

      for(let i = 0; i < CATview.tools.length; i++){
        let x, y;
        if(CATview.vertical === true){
          x =  i * (fontsize + padding) + fontsize/2;
          y = fontsize/2;
        } else {
          x = fontsize/2;
          y =  i * (fontsize + padding) + fontsize/2;
        }

        toolicons.append('text')
          .attr("class", "tool-icon")
          .attr("x", x)
          .attr("y", y)
          .attr("style", "text-anchor: middle; dominant-baseline: middle;")
          .attr("font-family","FontAwesome")
          //.attr("textLength", fontsize)
          //.attr("lengthAdjust","spacingAndGlyphs")
          .text(String.fromCharCode(parseInt(CATview.tools[i][0], 16)))
          .attr('font-size', fontsize - 4)
          .attr("transform", (function(){ return 'rotate(' + CATview.tools[i][2] + ' ' + x + ' ' + y + ')' }))
          .on("click", CATview.tools[i][1]);
      }
    }
  };

  // draws the alignment as colored rectangles as well as the edges-axis
  this.draw_alignment = function (){
    if(CATview.debug)
      console.log('CATview.draw_alignment: ' + CATview.from + " - " + CATview.to );

    if(CATview.content){
      // remove the edges of the previous visualization
      CATview.content.select(".alignment").selectAll("g.row_witness").remove();
      // get all edges within the given interval
      let edges_temp = CATview.edges.map(function(d, i) { return [d, i + 1];}).filter(function(d) { return CATview.from <= d[1] && d[1] <= CATview.to; });

      // get the max. width and height that is available for a segment
      let segment_width = Math.floor(CATview.width_content/(CATview.vertical === true ? CATview.names.length : edges_temp.length));
      if(segment_width < 1) segment_width = 1;
      let segment_height = Math.floor(CATview.height_content/(CATview.vertical === true ? edges_temp.length : CATview.names.length));
      if(segment_height < 1) segment_height = 1;

      // set width, height, margin and stroke for a rectangle
      CATview.rect_h_margin = Math.floor(segment_width/5);
      CATview.rect_width = segment_width - CATview.rect_h_margin;
      CATview.rect_v_margin = Math.floor(segment_height/5);
      CATview.rect_height = segment_height - CATview.rect_v_margin;
      CATview.rect_stroke = "stroke-width: " + ((segment_width >= 15 && segment_height >= 15) ? ((segment_width >= 30 && segment_height >= 30) ? 2 : 1) : 0) + ";";

      // create a grouping row for each edge
      let rows = CATview.content.select(".alignment").selectAll("g.row_witness")
        .data(edges_temp)
        .enter().append("g")
        .attr("class", "row_witness")
        .attr("transform", function(d) { return "translate(" +
          (CATview.vertical === true ? (-CATview.rect_width/2 + ", " + (CATview.scale_edges(parseInt(d[1]))-(CATview.rect_height/2))) :
            (CATview.scale_edges(parseInt(d[1]))-(CATview.rect_width/2)) + ", " + (-CATview.rect_height/2))
          + ")"; })
        .on('mouseenter', function(d, i){CATview.show_edge_name(i)})
        .on('mouseleave', function(){ CATview.hide_edge_name()});

      // draw the rects for the witnesses in each row
      rows.selectAll("rect")
        .data(function(d) { return d[0].map(function(d2, j) {return [j, (d[1] - 1), d2];}).filter( function(d2) { return d2[2] != "-1"; } ); })
				.enter().append("rect")
        .attr("class", "rect-segment")
        .attr('cursor', 'pointer')
        .attr("width", function(d){ return CATview.scaled_rect_width(d[1], d[0]); })
        .attr("height", function(d){ return CATview.scaled_rect_height(d[1], d[0]); })
        //.attr("ry", rect_corner)      // rounded Corners
        .attr(CATview.vertical === true ? "x" : "y", function(d) { return CATview.scaled_position(d[1], d[0]); })
        .attr("style", function(d) {
          return CATview.rect_stroke + CATview.rect_border + "fill: " +
            (parseFloat(d[2]) === 0.0 && CATview.use_equality_color ? CATview.equality_color : CATview.scale_color(parseFloat(d[2])));
        })
        .attr("data-segment-index", function(d) { return d[1] + "_" + d[0];})
        .on("mouseenter", function(d){ CATview.show_rect_linking(d[1]+"_"+d[0]); })
        .on("mouseleave", function(d){ CATview.hide_rect_linking(); })
        .on("click", function(d){
          CATview.click_on_edge_callback(d[0], d[1]);
        });

      // update the edges-axis
      CATview.edgesAxis.scale(CATview.scale_edges);
      CATview.content.select(".edges-axis").call(CATview.edgesAxis);
      CATview.content.select(".edges-axis").selectAll("text")
        .attr("style", "text-anchor: middle;")
        .attr("transform", function() {
          // rotate for 90 degrees than move the positions a bit to make them centered
          let transform = '';
          switch (CATview.orientation)
          {
            case "left": transform = 'translate(3, 0)'; break;
            case "right": transform = 'translate(-3, 0)'; break;
            default: break;
          }
          return transform;
        })
        .attr('font-size', CATview.font_size_x);
    }
    else
      return false;
  };

  this.set_edge_names = function(_names){
    if(CATview.debug)
      console.log('CATview.set_edge_names');
    if(_names == null)
      return false;
    CATview.edge_names = _names;
    return true;
  };
  this.show_edge_name = function (_pos) {
    if(CATview.debug)
      console.log('CATview.show_edge_name: ' + _pos);

    if(!CATview.edge_name_enabled)
      return false;

    // respect current zooming
    _pos += CATview.from - 1;

    CATview.edge_name.transition()
      .duration(200)
      .style("opacity", 1.0);

    if(CATview.edge_names[_pos] !== null && CATview.edge_names[_pos] !== undefined && CATview.edge_names[_pos] !== '')
      name = (_pos + 1).toString() + ' • ' + CATview.edge_names[_pos];
    else
      name = 'Position: ' + (_pos + 1).toString();

    // place the edge name central in respect to CATviews orientation
    let anchor_x = "left";
    let offset_x = "50%";
    let anchor_y = "top";
    let offset_y = document.getElementById("CATview").offsetTop + CATview.height_svg + 'px';
    let transform = "translate(-50%, 0)";
    switch(CATview.orientation) {
      case 'left':
        offset_x = CATview.width_svg + 'px';
        offset_y = "50%";
        transform = "translate(0, -50%)";
        break;
      case 'bottom':
        anchor_y = "bottom";
        // CATviews height + the distance to the bottom of the window
        offset_y = CATview.height_svg + window.innerHeight - document.getElementById("CATview").getBoundingClientRect().bottom + 'px';
        break;
      case 'right':
        anchor_x = "right";
        offset_x = CATview.width_svg + 'px';
        offset_y = "50%";
        transform = "translate(0, -50%)";
        break;
      default: // top
    }
    CATview.edge_name.html(name)
      .style(anchor_x, offset_x)
      .style(anchor_y, offset_y)
      .style("transform", transform);
  };
  this.hide_edge_name = function () {
    if(CATview.debug)
      console.log('CATview.hide_edge_name');
    CATview.edge_name.transition()
      .duration(200)
      .style("opacity", 0);
  };

  // draws the scroll spy as orange bar
  this.draw_scroll_spy = function(index){
    if(CATview.debug)
      console.log('CATview.draw_scroll_spy: ' + index);

    if (arguments.length === 1) CATview.scroll_spy_pos = parseInt(index) + 1;

    if(CATview.content){
      CATview.content.selectAll("rect.scroll_spy").remove();
      if(CATview.from <= CATview.scroll_spy_pos && CATview.scroll_spy_pos <= CATview.to)
      {
        if(CATview.vertical === true){
          let height = CATview.rect_height + 2 * (CATview.rect_v_margin/2);
          CATview.content.insert("rect", ".edges-axis")
            .attr("class", "scroll_spy")
            .attr("width", CATview.width_content)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", CATview.scale_edges(CATview.scroll_spy_pos) - (height/2));
        }
        else{
          let width = CATview.rect_width + 2 * (CATview.rect_h_margin/2);
          CATview.content.insert("rect", ".edges-axis")
            .attr("class", "scroll_spy")
            .attr("width", width)
            .attr("height", CATview.height_content)
            .attr("x", CATview.scale_edges(CATview.scroll_spy_pos) - (width/2))
            .attr("y", "0");
        }
      }
    }
    else
      return false;
  };

  // draws extra segments
  this.set_extra_segments = function(_segments){
    if(_segments == null)
      return false;

    // todo validate data
    CATview.extra_segments = _segments;
    return true;
  };
  this.toggle_display_extra_segments = function(_toggle){
    if(_toggle != null && typeof(_toggle) === "boolean")
      CATview.display_extra_segments = !_toggle;
    CATview.display_extra_segments = !CATview.display_extra_segments;

    return CATview.draw_extra_segments();
  };
  this.draw_extra_segments = function(){
    if(CATview.debug)
      console.log('CATview.draw_extra_segments');

    if(CATview.content) {
      CATview.content.select(".alignment").selectAll("rect.extra").remove();
      if (CATview.extra_segments == null)
        return false;

      if (CATview.display_extra_segments) {
        let rows = CATview.content.select(".alignment").selectAll("g.row_witness");

        CATview.extra_segments.forEach(function (segment) {
          let row = rows.filter(function (d, i) { return (i + CATview.from) === segment[0] + 1 });
          row.append('rect')
            .attr("class", "rect-segment extra")
            .attr('cursor', 'pointer')
            .attr("width", function(d){ return CATview.scaled_rect_width(segment[0], segment[1]) - 1;})
            .attr("height", function(d){ return CATview.scaled_rect_height(segment[0], segment[1]) - 2;})
            .attr(CATview.vertical === true ? "x" : "y", function(d) {
              return CATview.scaled_position(segment[0], segment[1]) + 1;
            })
            .attr("style", function(d) {
              return 'fill:transparent; stroke-width:2; stroke-dasharray:3,1; stroke:' +
                (parseFloat(segment[2]) === 0.0 && CATview.use_equality_color ? CATview.equality_color : CATview.scale_color(parseFloat(segment[2])));
            })
            .attr("data-segment-index",segment[0] + "_" + segment[1])
            .on("mouseenter", function(d){ CATview.show_rect_linking(segment[0]+"_"+segment[1]); })
            .on("mouseleave", function(d){ CATview.hide_rect_linking(); })
            .on("click", function(d){CATview.click_on_edge_callback(segment[1], segment[0]);} );
        });
      }
    }
    else
      return false;
  };

  // set the search results
  this.set_search_results = function(search_results){
    if(search_results == null)
      return false;

    CATview.search_results = search_results;
    return true;
  };

  // draws the search results by highlighting rectangles with yellow bars
  this.draw_search_results = function(){
    if(CATview.debug)
      console.log('CATview.draw_search_results');

    if(CATview.content){
      CATview.content.select(".search_results_background").selectAll('rect').remove();
      let segments = document.querySelectorAll('.search_result');
      for (let i = 0; i < segments.length; i++) {
        segments[i].classList.remove('search_result')
      }

      if(CATview.search_results){

        if(CATview.search_mode === 'seg'){
          // draw highlight-rectangles over the segment-rectangles
          // first filter the hits according to the zoom
          let hits = CATview.search_results.filter(function(d){return (CATview.from <= d[0] + 1 && d[0] +1 <= CATview.to)});

          if(hits.length > 0) {
            hits.forEach(function(edge){
              edge[1].forEach(function(name_idx){
                let seg = document.querySelector('[data-segment-index="' + edge[0] + '_' + name_idx + '"]')
                if(seg !== null) seg.classList.add("search_result")
              });
            });
          }
        }
        else{
          // draw full columns in the background of edges that include a search hit
          for (let i = 0; i < CATview.search_results.length; i++){
            let edge = CATview.search_results[i][0] + 1;
            // test whether the search hit is within the currently shown excerpt of the alignment
            if(CATview.from <= edge && edge <= CATview.to){
              if(CATview.vertical === true){
                let height = CATview.rect_height + 2;
                CATview.content.select(".search_results_background").append('rect')
                  .attr('class', 'search_result')
                  .attr("width", CATview.width_content - 4)
                  .attr("height", height)
                  .attr("x", 2)
                  .attr("y", CATview.scale_edges(edge) - (height/2));

              }
              else{
                let width = CATview.rect_width + 2;
                CATview.content.select(".search_results_background").append('rect')
                  .attr('class', 'search_result')
                  .attr("width", width)
                  .attr("height", CATview.height_content - 4)
                  .attr("x", CATview.scale_edges(edge) - (width/2))
                  .attr("y", 2);
              }
            }
          }
        }
      }
      return true;
    }
    else
      return false;
  };


  // public methods for rectangle scaling
  this.set_rect_scaling = function(_rect_scaling){
    if(CATview.debug)
      console.log('CATview.set_rect_scaling');
    // TODO validation
    this.rect_scaling = _rect_scaling;
    return true;
  };
  this.enable_rect_scaling = function(_mode){
    if(CATview.debug)
      console.log('CATview.enable_rect_scaling');

    CATview.rect_scaling_enabled = true;
    if(_mode === 'middle' )
      CATview.rect_scaling_mode = 'middle';
    else if (_mode === 'inverted')
      CATview.rect_scaling_mode = 'inverted';
    else
      CATview.rect_scaling_mode = 'default';
    CATview.refresh_content(CATview.from, CATview.to);
    return true;
  };
  this.disable_rect_scaling = function(){
    if(CATview.debug)
      console.log('CATview.disable_rect_scaling');

    CATview.rect_scaling_enabled = false;
    CATview.refresh_content(CATview.from, CATview.to);
    return true;
  };
  this.toggle_rect_scaling = function(){
    if(CATview.debug)
      console.log('CATview.toggle_rect_scaling');

    if(CATview.rect_scaling_enabled)
      return CATview.disable_rect_scaling();
    else
      return CATview.enable_rect_scaling(CATview.rect_scaling_mode);
  };
  // internal methods to define the dimensions and positioning of rectabgles in respect to rectangle scaling
  this.scaled_rect_width = function(_egde_idx, _name_idx){
    if(!CATview.rect_scaling_enabled || !CATview.vertical || CATview.rect_scaling === null){
      // return the default width on disabled scaling or horizontal orientation
      return CATview.rect_width;
    }

    let scaling = CATview.rect_scaling[_egde_idx][_name_idx];  // individual scaling of the segment/rectangle

    let minimal_size = CATview.rect_width * CATview.rect_scaling_minimum; // fixed minimal size of the rectangle
    let addable_size = CATview.rect_width - minimal_size;                 // variable size available to add
    return Math.round(minimal_size + scaling * addable_size);
  };
  this.scaled_rect_height = function(_egde_idx, _name_idx){
    if(!CATview.rect_scaling_enabled || CATview.vertical || CATview.rect_scaling === null){
      // return the default height on disabled scaling or vertical orientation
      return CATview.rect_height;
    }

    let scaling = CATview.rect_scaling[_egde_idx][_name_idx];  // individual scaling of the segment/rectangle

    let minimal_size = CATview.rect_height * CATview.rect_scaling_minimum; // fixed minimal size of the rectangle
    let addable_size = CATview.rect_height - minimal_size;                 // variable size available to add
    return Math.round(minimal_size + scaling * addable_size);
  };
  this.scaled_position = function(_egde_idx, _name_idx){
    if(!CATview.rect_scaling_enabled || CATview.rect_scaling_mode == 'inverted'){
      // the default value if scaling was disabled or on inverted mode
      return CATview.scale_names(CATview.drag_order_name2pos[_name_idx]);
    }

    if(CATview.vertical){
      let scaled = CATview.scaled_rect_width(_egde_idx, _name_idx)
      if(CATview.rect_scaling_mode === 'middle')
        scaled = (scaled + CATview.rect_width) / 2.0;
      // the original posittion + maximal size - used size
      return CATview.scale_names(CATview.drag_order_name2pos[_name_idx]) + CATview.rect_width - scaled
    }else{
      // get the scaled size
      let scaled = CATview.scaled_rect_height(_egde_idx, _name_idx)
      if(CATview.rect_scaling_mode === 'middle')
        scaled = (scaled + CATview.rect_height) / 2.0;
      // the original posittion + maximal size - used size
      return CATview.scale_names(CATview.drag_order_name2pos[_name_idx]) + CATview.rect_height - scaled
    }
  };


  // public methods for rectangle linking
  this.set_rect_linking_data = function(_data){
    if(CATview.debug)
      console.log('CATview.set_rect_linking_data');
    // TODO validation
    this.rect_linking_data = _data;
    return true;
  };
  this.enable_rect_linking = function(){
    if(CATview.debug)
      console.log('CATview.enable_rect_linking');

    CATview.rect_linking_enabled = true;

    return true;
  };
  this.disable_rect_linking = function(){
    if(CATview.debug)
      console.log('CATview.disable_rect_linking');

    CATview.rect_linking_enabled = false;
    CATview.hide_rect_linking();
    return true;
  };
  this.toggle_rect_linking = function(){
    if(CATview.debug)
      console.log('CATview.toggle_rect_linking');

    if(CATview.rect_linking_enabled)
      return CATview.disable_rect_linking();
    else
      return CATview.enable_rect_linking();
  };
  // internal methods for rectangle linking
  this.show_rect_linking = function(_idx) {
    if(CATview.debug)
      console.log('CATview.show_rect_linking: ' + _idx);

    if(!CATview.rect_linking_enabled)
      return false;

    CATview.rect_linking_data.forEach( function (group){
      if(group.indexOf(_idx) !== -1){
        group.forEach( function (group_member) {
          // add the 'rect_linked' class to highlight all segments in the group, including the one hovered
          let seg = document.querySelector('[data-segment-index="' + group_member + '"]');
          if(seg !== null) seg.classList.add("rect_linked");
        });
      }
    });
  };
  this.hide_rect_linking = function(){
    if(CATview.debug)
      console.log('CATview.hide_rect_linking');

    // remove all 'rect_linked' classes
    let segments = document.querySelectorAll('.rect_linked');
    for (let i = 0; i < segments.length; i++) {
      segments[i].classList.remove('rect_linked');
    }
  };

  // callback to switch the order of edges
  this.invert_edges_axis = function(){
    if(CATview.debug)
      console.log('CATview.invert_edges_axis');

    CATview.x_inverted = !CATview.x_inverted;

    if(CATview.content){
      CATview.set_margins();
      CATview.set_scale_edges(0, CATview.edges.length + 1);
      CATview.scale_edges_original = CATview.scale_edges.copy();
      // relocate the content container
      CATview.svg.select(".content").attr("transform", "translate(" + CATview.margin.left + "," + CATview.margin.top + ")");
      CATview.draw_zebra_stripes();
      CATview.draw_edges_axis();
      CATview.draw_names_axis();
      CATview.draw_tool_icons();
      CATview.refresh_content(CATview.from, CATview.to);
    }
    else
      return false;
  };

  // callback to switch the order of text witnesses
  this.invert_names_axis = function(){
    if(CATview.debug)
      console.log('CATview.invert_names_axis');

    let name2pos = CATview.get_names_order(); //  map: name index → position index
    let pos2name = Array(name2pos.length);    //  create map: position index → name index
    for(let i = 0; i < name2pos.length; i++)
      pos2name[name2pos[i]] = i;
    pos2name.reverse();                       // invert the positions
    for(let i = 0; i < pos2name.length; i++)  // remap to: name index → position index
      name2pos[pos2name[i]] = i;

    return CATview.set_names_order(name2pos);
  };

  // set the maximum zooming level (enable or disable zooming)
  this.set_max_zoom = function(max){
    max = parseFloat(Number(max));
    if(isNaN(max)){
      // the default value will allow to increase the size of edges as far as only ten of them can be displayed
      max = CATview.edges.length / 10;
    }
    else if (max < 1 ) {
      // setting the maximum scale to 1 will disable the zoom
      max = 1.0;
    }

    CATview.zoom.scaleExtent([1, max]);

    // todo react if current zoom bigger than max?

    return true;
  };

  this.set_zoom = function(_factor) {
    if (CATview.zoom.scaleExtent()[0] <= _factor && _factor <= CATview.zoom.scaleExtent()[1]){
      CATview.zoom.scaleTo(CATview.content, _factor);
    }
  };

  this.zoom_in = function() {
    CATview.zoom_button_clicked = true;
    if (CATview.scale+CATview.zoom_step <= CATview.zoom.scaleExtent()[1]){
      CATview.zoom.scaleTo(CATview.content, CATview.scale+CATview.zoom_step);
    }
    else {
      // we hit a boundary, might as well set scale to the boundary
      // sometimes mixed scaling with mouse wheel and buttons causes the zoom-step to be
      // too large so it would exceed the boundary. In that case clip to the boundary
      CATview.zoom.scaleTo(CATview.content, CATview.zoom.scaleExtent()[1]);
    }
  };

  this.zoom_out = function() {
    CATview.zoom_button_clicked = true;
    if (CATview.scale-CATview.zoom_step >= CATview.zoom.scaleExtent()[0]){
      CATview.zoom.scaleTo(CATview.content, CATview.scale-CATview.zoom_step);
    }
    else{
      CATview.zoom.scaleTo(CATview.content, CATview.zoom.scaleExtent()[0]);
    }
  };

  // callback with functionality for scaling and translation of the content
  this.zooming = function () {
    if(CATview.debug)
      console.log('CATview.zooming');

    let new_scale = d3.event.transform.k;
    let new_translate = CATview.vertical === true ? (d3.event.transform.y/new_scale) : (d3.event.transform.x/new_scale);

    if(CATview.content){

      let delta_translate = 0;
      let scale_from = 0;
      let scale_to = 0;
      let current_size = CATview.vertical === true ? CATview.height_content : CATview.width_content;
      // if the scale factor has changed
      if (new_scale !== CATview.scale) {
        // calculate the change of the size
        let delta_size = (current_size / new_scale) - (current_size / CATview.scale);
        // distribute the change of the size among the left/top and right/bottom site due to the relative mouse center

        // simulate central mouse position in case of zoom button clicks
        if (CATview.zoom_button_clicked){
          var art_mouse_x = CATview.width_content/2;
          var art_mouse_y = CATview.height_content/2;
          scale_from = delta_size * ((CATview.vertical === true ? art_mouse_y : art_mouse_x) / current_size);
          CATview.zoom_button_clicked = false;
        }
        else{
          scale_from = delta_size * ((CATview.vertical === true ? d3.mouse(this)[1] : d3.mouse(this)[0]) / current_size);
        }
        scale_to = delta_size - scale_from;
      }
      else if(CATview.display_brush === false){
        // calculate the relative translation (only if the brush function is disabled)
        delta_translate = CATview.translate - new_translate;
      }

      // calculate the new left and right position in the original scale (0 upto size)
      let offset = 0;     // if the limit of one site is reached, add the remaining pixels to the other site
      let new_from_pixel = CATview.from_pixel - scale_from + delta_translate;
      if (new_from_pixel < 0)       // the limit of the left site was reached
      {
        offset = -new_from_pixel;
        new_from_pixel = 0;
      }
      let new_to_pixel = CATview.to_pixel + scale_to + delta_translate + offset;
      if (new_to_pixel > current_size)  // the limit of the right site was reached
      {
        offset =  new_to_pixel - current_size;
        new_to_pixel = current_size;
        new_from_pixel -= offset;
      }

      // return when one of the new interval borders is not legit (e.g. by double clicking a rectangle)
      if(isNaN(new_from_pixel) || isNaN(new_to_pixel))
        return false;

      // save the parameters of this call
      CATview.from_pixel = new_from_pixel;
      CATview.to_pixel = new_to_pixel;
      CATview.translate = new_translate;
      CATview.scale = new_scale;

      // calculate the edges within this new zoom
      let new_from = Math.ceil(CATview.scale_edges_original.invert(new_from_pixel));
      let new_to = Math.floor(CATview.scale_edges_original.invert(new_to_pixel));
      if(CATview.x_inverted){
        let swap = new_from;
        new_from = new_to;
        new_to = swap;
      }
      if(new_from !== CATview.from || new_to !== CATview.to) {
        // refresh the content only if edges within the new zoom have changed
        CATview.refresh_content(new_from, new_to);
      }

      // refresh the brush
      if(CATview.brush) {
        let from = CATview.brush_from_edge + 1.0 + CATview.brush_offset_from;
        let to = CATview.brush_to_edge + 1.0 + CATview.brush_offset_to;
        if(CATview.x_inverted){
          let swap = from;
          from = to;
          to = swap;
        }
        CATview.brush.move(d3.select('.brush'), [from, to].map(CATview.scale_edges))
        // TODO prevent brushing listeners
      }
    }
    else
      return false;
  };

  // set the callback after a click on a rectangle (will receive: (wit, edge))
  this.set_click_on_edge_callback = function(click_on_edge_callback) {
    CATview.click_on_edge_callback = click_on_edge_callback;

    return true;
  };

  // enable the brush functionality and pass
  // a callback function to the brush (will receive: from_edge, to_edge, from_name, to_name)
  this.enable_brush = function(_brush_callback, _brush_end_callback){
    if(CATview.debug)
      console.log('CATview.enable_brush');

    if(CATview.display_brush === false){
      CATview.display_brush = true;
      // add the brush to CATview
      if(CATview.content)
        CATview.draw_brush();
    }
    if(_brush_callback != null)
      CATview.brush_callback = _brush_callback;
    if(_brush_end_callback != null)
      CATview.brush_end_callback = _brush_end_callback;

    return true;
  };

  // disable the brush functionality and set the attributes back in default state
  this.disable_brush = function(){
    if(CATview.debug)
      console.log('CATview.disable_brush');

    if(CATview.display_brush === true) {
      // reset the brush's attributes
      CATview.display_brush = false;
      CATview.brush_from_edge = -1;
      CATview.brush_to_edge = -1;
      CATview.brush_from_name = -1;
      CATview.brush_to_name = -1;
      // remove the brush from CATview
      if (CATview.content)
        CATview.content.select(".brush").remove();
      // pass the full interval to the callback on remove
      if(CATview.brush_callback != null && CATview.edges.length > 0){
        CATview.brush_callback(0, CATview.edges.length - 1, 0, CATview.names.length - 1);
      }
    }
  };

  // add the brush element to the svg
  this.draw_brush = function(){
    if(CATview.debug)
      console.log('CATview.draw_brush');

    if(CATview.content){
      if(CATview.display_brush === true){
        // remove previous brush
        CATview.content.select(".brush").remove();
        // add the brush to CATview

        if(CATview.vertical === true) {
          CATview.brush = d3.brushY()
            .on("brush", CATview.brushing)
            .on("end", CATview.brush_end);

          if(CATview.x_inverted)
            CATview.brush.extent([[CATview.scale_names.range()[0], CATview.scale_edges.range()[1]], [CATview.scale_names.range()[1], CATview.scale_edges.range()[0]]]);
          else
            CATview.brush.extent([[CATview.scale_names.range()[0], CATview.scale_edges.range()[0]], [CATview.scale_names.range()[1], CATview.scale_edges.range()[1]]]);
        } else {
          CATview.brush = d3.brushX()
            .on("brush", CATview.brushing)
            .on("end", CATview.brush_end);

          if(CATview.x_inverted)
            CATview.brush.extent([[CATview.scale_edges.range()[1], CATview.scale_names.range()[0]], [CATview.scale_edges.range()[0], CATview.scale_names.range()[1]]]);
          else
            CATview.brush.extent([[CATview.scale_edges.range()[0], CATview.scale_names.range()[0]], [CATview.scale_edges.range()[1], CATview.scale_names.range()[1]]]);
        }

        CATview.content.append("g")
          .attr("class", "brush")
          .call(CATview.brush);
      }
      return true;
    }
    else
      return false;
  };

  // place brush at a specific position (defined by indices)
  this.place_brush = function(_from, _to, _trigger_callback, _trigger_end_callback){
    if(CATview.debug)
      console.log('CATview.place_brush: ' + _from + ', ' + _to);

    // enable brush as it might be currently uninitialized
    CATview.enable_brush();

    // save the new interval
    let brush_range = _to - _from + 1;
    CATview.brush_from_edge = _from;
    CATview.brush_to_edge = _to;
    CATview.brush_range = brush_range;

    // draw the new interval
    if(CATview.x_inverted) {
      CATview.brush.move(d3.select(".brush"),
        [_to + 1.0 + CATview.brush_offset_to, _from + 1.0 + CATview.brush_offset_from].map(CATview.scale_edges));
    }
    else {
      CATview.brush.move(d3.select(".brush"),
        [_from + 1.0 + CATview.brush_offset_from, _to + 1.0 + CATview.brush_offset_to].map(CATview.scale_edges))
    }

    // may trigger callbacks
    if (_trigger_callback && CATview.brush_callback != null) {
      CATview.brush_callback(_from, _to); //, from_name, to_name);
    }
    if (_trigger_end_callback && CATview.brush_end_callback != null) {
      CATview.brush_end_callback(_from, _to); //, from_name, to_name);
    }

    return true;
  }

  // set the callback after brushing
  this.set_brush_callback = function(brush_callback) {
    CATview.brush_callback = brush_callback;

    return true;
  };
  this.set_brush_end_callback = function(_brush_end_callback) {
    CATview.brush_end_callback = _brush_end_callback;

    return true;
  };

  // react on changes of the brush
  this.brushing = function() {
    if(CATview.debug)
      console.log('CATview.brushing');

    // handle inverted edges axis
    let from = CATview.x_inverted ? 1 : 0;

    // the starting position is construction by:
    //    d3.event.selection[0] → current begin of the drawn selection window
    //    CATview.brush_offset_from → the specified offset used to place the window at the begin of a rectangle
    //    0.001 → a little additional offset for the case that the window was dragged to the most right position
    let from_edge = Math.round(CATview.scale_edges.invert(d3.event.selection[from]) - CATview.brush_offset_from - 0.001) -1;
    if(from_edge < CATview.from - 1) from_edge = CATview.from - 1;
    else if(from_edge >= CATview.to) from_edge = CATview.to - 1;

    // add the current range to the from position to get the to position
    let to_edge = from_edge + CATview.brush_range - 1;

    // TODO may allow selection of names axis
    //let from_name = null; // Math.ceil(CATview.brush.extent()[0][names_index]);
    //let to_name = null; // Math.floor(CATview.brush.extent()[1][names_index]);

    if(to_edge - from_edge >= 0) {
      // check whether the interval has changed
      if (from_edge !== CATview.brush_from_edge || to_edge !== CATview.brush_to_edge){ // || from_name != CATview.brush_from_name || to_name != CATview.brush_to_name) {
        // save the current interval
        CATview.brush_from_edge = from_edge;
        CATview.brush_to_edge = to_edge;
        //CATview.brush_from_name = from_name;
        //CATview.brush_to_name = to_name;
        // call the brush_callback as the interval has changed
        if (CATview.brush_callback != null) {
          CATview.brush_callback(from_edge, to_edge, null, null); //, from_name, to_name);
        }
        else {
          // no callback specified → log positions to console
          console.log('CATview brush edge from ' + from_edge + ' to ' + to_edge);// + ' and name from ' + from_name + ' to ' + to_name);
        }
      }
    }
  };
  // react on the end of a brush gesture
  this.brush_end = function() {
    if(CATview.debug)
      console.log('CATview.brush_end');

    if (!d3.event.sourceEvent) return; // only transition after input
    if (!d3.event.selection) return; // ignore empty selections

    // handle inverted edges axis
    let from = CATview.x_inverted ? 1 : 0;
    let to = CATview.x_inverted ? 0 : 1;

    // the starting position (end analogously) is construction by:
    //    d3.event.selection[0] → current begin of the drawn selection window
    //    CATview.brush_offset_from → the specified offset used to place the window at the begin of a rectangle
    //    0.001 → a little additional offset for the case that the window was dragged to the most right position
    let from_edge = Math.round(CATview.scale_edges.invert(d3.event.selection[from]) - CATview.brush_offset_from - 0.001) -1;
    if(from_edge < CATview.from - 1) from_edge = CATview.from - 1;
    else if(from_edge >= CATview.to) from_edge = CATview.to - 1;
    let to_edge = Math.round(CATview.scale_edges.invert(d3.event.selection[to]) - CATview.brush_offset_to + 0.001) -1;
    if(to_edge >= CATview.to) to_edge = CATview.to - 1;
    else if(to_edge < CATview.from - 1) to_edge = CATview.from - 1;

    // calculated the number of rectangles within the window
    let brush_range = to_edge - from_edge + 1;

    // intervene if range is zero
    if(brush_range === 0){
      console.log('intervene')
      to_edge = from_edge;
      brush_range = 1;
    }

    // smoothly redraw the brush to discrete positions (begin and end of the rectangles)
    if(CATview.x_inverted){
      d3.select(this).transition().call(d3.event.target.move,
        [to_edge + 1.0 + CATview.brush_offset_to, from_edge + 1.0 + CATview.brush_offset_from].map(CATview.scale_edges));
    }else{
      d3.select(this).transition().call(d3.event.target.move,
        [from_edge + 1.0 + CATview.brush_offset_from, to_edge + 1.0 + CATview.brush_offset_to].map(CATview.scale_edges));
    }

    // save new values if there was a change
    if(from_edge !== CATview.brush_from_edge || to_edge !== CATview.brush_to_edge || brush_range !== CATview.brush_range){
      // save the current interval
      CATview.brush_from_edge = from_edge;
      CATview.brush_to_edge = to_edge;
      CATview.brush_range = brush_range;
      // and call the custom callbacks
      if (CATview.brush_end_callback != null) {
        CATview.brush_end_callback(from_edge, to_edge); //, from_name, to_name);
      }
    }
  };

  // add a new tool icon and its behavior
  this.add_tool = function(_icon, _callback, _index, _rotation){
    let index = parseInt(_index);
    if (isNaN(index) || index < 0 || index > CATview.tools.length )
      index = CATview.tools.length;

    let rotation = (typeof _rotation === 'undefined') ? 0 : parseInt(_rotation);

    CATview.tools.splice(index, 0, [_icon, _callback, rotation]);

    return true;
  };
  // remove a tool
  this.remove_tool = function(index){
    index = parseInt(Number(index));
    if (isNaN(index) || index < 0 || index >= CATview.tools.length )
      return false;

    CATview.tools.splice(index, 1);

    return true;
  };
  // add the invert-x-axis tool
  this.add_tool_invert_edges_axis = function(index){
    return CATview.add_tool('f0dc',
      function(){CATview.invert_edges_axis();},
      index,
      CATview.vertical ? 0 : 90);
  };
  // add the invert-y-axis tool
  this.add_tool_invert_names_axis = function(index){
    return CATview.add_tool('f0dc',
      function(){CATview.invert_names_axis();},
      index,
      CATview.vertical ? 90 : 0);
  };
  // add the switch-highlight-mode-of-search-results tool
  this.add_tool_toggle_search_mode = function(index){
    return CATview.add_tool('f002',
      function(){
        CATview.search_mode = (CATview.search_mode === 'seg' ? 'col' : 'seg');
        CATview.draw_search_results();},
      index,
      0);
  };
  // add the enable/disable-brush tool
  this.add_tool_toggle_brush = function(index){
    return CATview.add_tool('f1fc', // f096
      function(){
        if(CATview.display_brush)
          CATview.disable_brush();
        else
          CATview.enable_brush();},
      index,
      0);
  };
  // add a tool that toggles the rectangle scaling
  this.add_tool_toggle_rect_scaling = function(index){
    return CATview.add_tool(
      'f037', // (CATview.vertical ? 'f036' : 'f038'),
      function(){CATview.toggle_rect_scaling()},
      index,
      (CATview.vertical ? 0 : 90 ));
  };
  this.add_tool_zoom_in = function(index){
    return CATview.add_tool('f00e', // f067
      function(){CATview.zoom_in();},
      index,
      0);
  };
  this.add_tool_zoom_out = function(index){
    return CATview.add_tool('f010', // f068
      function(){CATview.zoom_out();},
      index,
      0);
  };


  //todo remove and set the identifiers of the witnesses
  this.set_names = function(names){
    // todo add dummies or remove values in data structures
    CATview.names = names;
    return true;
  };
  //add a name
  this.add_name = function(name, index){
    if(CATview.names == null)
      return false;
    index = parseInt(Number(index));
    if (isNaN(index) || index < 0 || index > CATview.names.length )
      index = CATview.names.length;

    // add the name
    CATview.names.splice(index, 0, name);

    // add dummies to edges
    CATview.edges.forEach(function (edge) {
      edge.splice(index, 0, -1)
    });

    // refresh the search results
    CATview.search_results.forEach(function (edge) {
      for(let i = 0; i < edge[1].length; i++){
        if(edge[1][i] >= index)
          edge[1][i] += 1
      }
    });

    // refresh the extra segments
    CATview.extra_segments.forEach(function (segment) {
      if(segment[1] >= index)
        segment[1] += 1;
    });

    // refresh the data for rectangle scaling (add dummies as for edges)
    if(CATview.rect_scaling !== null){
      CATview.rect_scaling.forEach(function (edge) {
        edge.splice(index, 0, -1)
      });
    }

    // refresh the data for rectangle linking
    if(CATview.rect_linking_data !== null){
      CATview.rect_linking_data.forEach(function (group) {
        for(let i = 0; i < group.length; i++){
          let wit = parseInt(group[i].split('_')[1])
          if(wit >= index)
            group[i] = ( group[i].split('_')[0] + '_' + (wit + 1) )
        }
      });
    }

    // TODO may refresh drag_names_order ...

    return true;
  };
  //remove a witness and its values in all data structures
  this.remove_name = function(index){
    index = parseInt(Number(index));
    if (isNaN(index) || CATview.names == null || index < 0 || index >= CATview.names.length )
      return false;

    CATview.names.splice(index, 1);

    // remove edges
    CATview.edges.forEach(function (edge) {
      edge.splice(index, 1)
    });

    // refresh the search results
    CATview.search_results.forEach(function (edge) {
      for(let i = edge[1].length - 1; i >= 0; i--){
        if(edge[1][i] > index)
          edge[1][i] -= 1
        else if (edge[1][i] == index)
          edge[1].splice(i, 1)
      }
    });

    // refresh the extra segments
    for(let i = CATview.extra_segments.length - 1; i >= 0; i--) {
      if(CATview.extra_segments[i][1] > index)
        CATview.extra_segments[i][1] -= 1
      else if (CATview.extra_segments[i][1] == index)
        CATview.extra_segments.splice(i, 1)
    }

    // refresh the data for rectangle scaling (remove within edges)
    if(CATview.rect_scaling !== null){
      CATview.rect_scaling.forEach(function (edge) {
        edge.splice(index, 1)
      });
    }

    // refresh the data for rectangle linking
    if(CATview.rect_linking_data !== null){
      CATview.rect_linking_data.forEach(function (group) {
        for(let i = 0; i < group.length; i++){
          let wit = parseInt(group[i].split('_')[1])
          if(wit > index)
            group[i] = ( group[i].split('_')[0] + '_' + (wit - 1 ) )
          else if(wit == index)
            group.splice(i, 1)
        }
      });
    }

    // TODO may refresh drag_names_order ...

    return true;
  };
  // rename the witness at a specific index
  this.replace_name = function(name, index){
    index = parseInt(Number(index));
    if (isNaN(index) || CATview.names == null || index < 0 || index >= CATview.names.length )
      return false;

    CATview.names[index] = name;

    // todo update edges

    return true;
  };
  // overwrite the alignment edges
  this.set_edges = function(edges){
    CATview.edges = edges;
    return true;
  };
  // add a single edge
  this.add_edge = function(edge, index){
    if(CATview.edges == null)
      return false;

    index = parseInt(Number(index));
    if (isNaN(index) || index < 0 || index > CATview.edges.length )
      index = CATview.edges.length;

    // handle malformed parameter
    while(edge.length > CATview.names.length)
      edge.pop();
    while(edge.length < CATview.names.length)
      edge.push(-1);

    CATview.edges.splice(index, 0, edge);

    // refresh the search results
    for(let i = 0; i < CATview.search_results.length; i++){
      if(CATview.search_results[i][0] >= index)
        CATview.search_results[i][0] += 1
    }

    // refresh the extra segments
    CATview.extra_segments.forEach(function (segment) {
      if(segment[0] >= index)
        segment[0] += 1;
    });

    // refresh the data for rectangle scaling (add dummies as for edges)
    if(CATview.rect_scaling !== null){
      let scales = []
      for(let i = 0; i < edge.length; i++)
        if(edge[i] == -1)
          scales.push(-1);
        else
          scales.push(1);
      CATview.rect_scaling.splice(index, 0, scales);
    }

    // refresh the data for rectangle linking
    if(CATview.rect_linking_data !== null){
      CATview.rect_linking_data.forEach(function (group) {
        for(let i = 0; i < group.length; i++){
          let row = parseInt(group[i].split('_')[0])
          if(row >= index)
            group[i] = ( (row + 1) + '_' + group[i].split('_')[1] )
        }
      });
    }

    // TODO may refresh available zooming level ...

    return true;
  };
  // remove a single edge
  this.remove_edge = function(index){
    index = parseInt(Number(index));
    if (isNaN(index) || CATview.edges == null || index < 0 || index >= CATview.edges.length )
      return false;

    CATview.edges.splice(index, 1);

    // refresh the search results
    for(let i = CATview.search_results.length - 1; i >= 0 ; i--){
      if(CATview.search_results[i][0] > index)
        CATview.search_results[i][0] -= 1
      else if (CATview.search_results[i][0] == index)
        CATview.search_results.splice(i, 1)
    }

    // refresh the extra segments
    for(let i = CATview.extra_segments.length - 1; i >= 0; i--) {
      if(CATview.extra_segments[i][0] > index)
        CATview.extra_segments[i][0] -= 1
      else if (CATview.extra_segments[i][0] == index)
        CATview.extra_segments.splice(i, 1)
    }

    // refresh the data for rectangle scaling (remove within edges)
    if(CATview.rect_scaling !== null){
      CATview.rect_scaling.forEach(function (edge) {
        edge.splice(index, 1)
      });
    }

    // refresh the data for rectangle scaling (add dummies as for edges)
    if(CATview.rect_scaling !== null){
      CATview.rect_scaling.splice(index, 1);
    }

    // refresh the data for rectangle linking
    if(CATview.rect_linking_data !== null){
      CATview.rect_linking_data.forEach(function (group) {
        for(let i = 0; i < group.length; i++){
          let row = parseInt(group[i].split('_')[0])
          if(row > index)
            group[i] = ( (row - 1 ) + '_' + group[i].split('_')[1] )
          else if(row == index)
            group.splice(i, 1)
        }
      });
    }

    // TODO may refresh available zooming level ...

    return true;
  };
  // replace a single edge
  this.replace_edge = function(edge, index, extra){
    index = parseInt(Number(index));
    if (isNaN(index) || CATview.edges == null || index < 0 || index >= CATview.edges.length )
      return false;

    CATview.edges[index] = edge;

    if (extra != null && !isNaN(index) && CATview.extra_segments != null && index > 0 && index < CATview.extra_segments.length )
      CATview.extra_segments[index] = extra;

    return true;
  };

  this.set_color_scale = function(_from, _to, _border){

    if(_from === null || _from === undefined) _from = "#c1c1e9";
    if(_to === null || _to === undefined) _to = "#0000a3";
    if(_border === null || _border === undefined) _border = "#2f2f86";

    CATview.scale_color = d3.scaleLinear().domain([0, 1]).range([_from, _to]);

    CATview.rect_border = "stroke: " + _border + ";";

    return CATview.refresh_content();
  };
  this.set_background_color = function(color){
    if(color == null)
      return false;

    document.querySelector('#CATview svg').style.backgroundColor = color;
    document.querySelector('#CATview .edge-name').style.backgroundColor = color;
    return true;
  };

  // enable/disable console output to debug
  this.toggle_debug = function(debug){
    if(debug != null && typeof(debug) === "boolean")
      CATview.debug = !debug;

    CATview.debug = !CATview.debug;
    return true;
  };

  // todo
  // - may: method to set search_mode → toggle_search_mode(_mode)
  // - may: method for changing the border_color → set_border(_color, _width)
  // - adopt font size in respect to the number of witnesses
  // - method to reset all data → reset
};

window.CATview = CATview;
