  import { sequence } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import * as d3 from 'd3';

  interface NodeData {
    name: string;
    size?: number;
    imports?: string[];
    century?: string;
    continuum?: string;
    copy_group?: string;
    sequence?: string;
    
  }

  @Component({
      selector: 'kalila-edition-graph',
      templateUrl: './graph.component.html',
      styleUrls: ['./graph.component.scss'],
      encapsulation: ViewEncapsulation.None,
      standalone: false
  })
  export class GraphComponent implements OnInit, OnDestroy {
    @ViewChild('chartContainer', { static: true })
    chartContainer!: ElementRef;

    private graphData: NodeData[] = [];

    private link!: d3.Selection<SVGPathElement, any, SVGGElement, unknown>;
    private node!: d3.Selection<SVGTextElement, d3.HierarchyNode<NodeData>, SVGGElement, unknown>;

    

    selectionStates: { [category: string]: { [groupName: string]: boolean } } = {
      continuum: {
        'early group': false,
        'london continuum': false,
        'paris continuum': false,
        'iberian continuum': false,
        'queen continuum': false,
        'cross copy': false,
      },
      copy_group: {
        'Paris 3471': false,
        'Paris 3465': false,
        'Ayasofya 4214': false,
        'München 618': false,
        'Hamburg 170': false,
        'Paris 2789': false,
        'Princeton 169H': false,
        'Riyadh 2536': false,
        'Arch. Mus. EY 344': false
      },
      sequence: {
        'sequence A': false,
        'sequence B': false,
        'sequence C': false,
        'sequence D' : false,
        'sequence E': false,
        'sequence F': false,
        'sequence G': false,
        'sequence H': false
      }
    };


  groupCategories: { [category: string]: string[] } = {
    continuum: [
      'early group',
      'london continuum',
      'paris continuum',
      'iberian continuum',
      'queen continuum',
      'cross copy'
    ],
    copy_group: [
      'Paris 3471',
      'Paris 3465',
      'Ayasofya 4214',
      'München 618',
      'Hamburg 170',
      'Paris 2789',
      'Princeton 169H',
      'Riyadh 2536',
      'Arch. Mus. EY 344'
    ],
    sequence: [
      'sequence A',
      'sequence B',
      'sequence C',
      'sequence D',
      'sequence E',
      'sequence F',
      'sequence G',
      'sequence H'      
    ]
  }; 

    private centuryColorMap: { [key: string]: string } = {
      '10th - 13th century': '#cbdff2', 
      '13th century': '#c6dbef',
      '14th century': '#8bb7db',
      '15th century': '#5a94c6',
      '16th century': '#2f75b2',
      '17th century': '#1b5690',
      '18th century': '#103d69',
      '19th century': '#072944',
      '20th century': '#031a2c',
      'unspecified': '#999999'  
    };

    private continuumColorMap: { [key: string]: string } = {
      'london continuum': '#C0C0C0',
      'paris continuum': '#C0C0C0',
      'iberian continuum': '#C0C0C0',
      'queen continuum': '#C0C0C0',
      'early group': '#C0C0C0',
      'cross copy': '#C0C0C0'
    };

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
      this.route.data.subscribe(data => {
        this.graphData = data['graphData']
        console.log('Resolved Graph Data:', this.graphData);
        this.renderGraph(this.graphData);
        this.renderLegend();
      });
    }

    resetGraph(): void {
      Object.keys(this.selectionStates).forEach(category => {
      Object.keys(this.selectionStates[category]).forEach(key => {
        this.selectionStates[category][key] = false;
      });
    });      
      d3.select(this.chartContainer.nativeElement).selectAll('*').remove();      
      this.renderGraph(this.graphData);
    }
    
    ngOnDestroy() {
      d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
    }

    private renderGraph(classes: NodeData[]) {
      d3.select(this.chartContainer.nativeElement).selectAll('*').remove();

      const diameter = 860;
      const radius = diameter / 2;
      const innerRadius = radius - 170;

      const cluster = d3.cluster().size([360, innerRadius]);

      const line = d3.lineRadial<any>()
        .curve(d3.curveBundle.beta(0.85))
        .radius((d) => d.y)
        .angle((d) => d.x / 180 * Math.PI);

      const svg = d3.select(this.chartContainer.nativeElement)
        .append('svg')
        .attr('width', diameter)
        .attr('height', diameter)
        .append('g')
        .attr('transform', `translate(${radius}, ${radius})`);

      const root = this.packageHierarchy(classes);
      root.sum((d: NodeData) => d.size || 0);
      
      root.sort((a, b) => {
        const centuryA = a.data?.century || '';
        const centuryB = b.data?.century || '';
        if (centuryA === centuryB) return 0;
        return centuryA < centuryB ? -1 : 1;
      });

      cluster(root);

      if (d3.select('.tooltip').empty()) {
        this.tooltip = d3.select('body').append('div').attr('class', 'tooltip');
      } else {
        this.tooltip = d3.select('.tooltip');
      }


      function spreadNodesWithGaps(leaves: any[]) {  
        const groupedByCentury = d3.group(leaves, d => d.data.century || '');
        const centuries = Array.from(groupedByCentury.keys()).sort((a, b) => {
          if (!a) return -1; 
          if (!b) return 1;
          return parseInt(a) - parseInt(b);
        });
        const totalAngle = 360;
        const gapBetweenCenturies = 5; 
        const totalGap = gapBetweenCenturies * centuries.length;
        const availableAngle = totalAngle - totalGap;
        const totalNodes = leaves.length;

        let currentAngle = 0;

        centuries.forEach(century => {
          const nodes = groupedByCentury.get(century) || [];
          const clusterAngleSize = (nodes.length / totalNodes) * availableAngle;

          nodes.forEach((node, i) => {
            node.x = currentAngle + (i / nodes.length) * clusterAngleSize;
          });

          currentAngle += clusterAngleSize + gapBetweenCenturies;
        });
      }

      const leaves = root.leaves();
      spreadNodesWithGaps(leaves);


      this.link = svg.append('g')
        .selectAll('.link')
        .data(this.packageImports(root.leaves()))
        .enter().append('path')
        .attr('class', 'link')
        .each((d: any) => { d.source = d[0]; d.target = d[d.length - 1]; })
        .attr('d', line as any)
        .style('stroke', (d: any) => {
          const continuum = d.source.data.continuum; 
          return this.continuumColorMap[continuum] || '#999';
        });

        
      
      this.node = svg.append('g')
        .selectAll('.node')
        .data(root.leaves())
        .enter().append('text')
        .attr('class', 'node')
        .attr('dy', '0.31em')
        .attr('transform', (d: any) => `rotate(${d.x - 90})translate(${d.y + 8},0)${d.x < 180 ? '' : 'rotate(180)'}`)
        .attr('text-anchor', (d: any) => (d.x < 180 ? 'start' : 'end'))
        .attr('fill', (d: any) => {
          const century = d.data.century;
          return this.centuryColorMap[century] || '#99b5bd';
        })
        .text((d: any) => d.data.name)
        .on('mouseover', (event: any, d: any) => this.mouseovered(event, d))
        .on('mouseout', this.mouseouted.bind(this));

      
    }

    private tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip');


    private mouseovered(event: MouseEvent, d: any) {
      this.node.each((n: any) => { n.target = n.source = false; });

      this.link
        .classed('link--target', (l: any) => {
          if (l?.target?.data && d?.data) {
            if (l.target.data === d.data) {
              l.source.source = true;
              return true;
            }
          }
          return false;
        })
        .classed('link--source', (l: any) => {
          if (l?.source?.data && d?.data) {
            if (l.source.data === d.data) {
              l.target.target = true;
              return true;
            }
          }
          return false;
        })
        .filter((l: any) => {
          return (l?.target?.data === d || l?.source?.data === d);
        })
        .raise();

      this.node
        .classed('node--target', (n: any) => n.target)
        .classed('node--source', (n: any) => n.source);

      this.node.classed('node-hovered', false); 

      //anyContinuumSelected is true if at least one continuum is selected.
      const anySelectionActive = Object.values(this.selectionStates)
        .some(categoryObj => Object.values(categoryObj).some(v => v))

      // checks if anyContinuumSelected is false - if nothing selected 
      if (!anySelectionActive) {   
        // from the selection of nodes (this.node), keep only the ones whose bound data n (data bound to each node in the selection) is equal to d (data bound to the hovered node).   
        // n here contains all the nodes bcs no continuum was selected, d is the one that is hovered 
        // so it gets classed as 'node-hovered'
        this.node.filter(n => n === d).classed('node-hovered', true);
      } else {
        // each() is a D3 method, which runs a function once for each element in the D3 selection
        // n - data bound to the element
        // i - index of the element in the group
        // nodes - entire array of selected DOM nodes
        this.node.each((n: any, i, nodes) => {
          console.log("n: ", n);
          console.log("i ", i);
          console.log("nodes: ", nodes);
          //[] to access a value of a key, just like in Python - the name of the selected continuum
          const isActive = this.selectionStates['continuum'][n.data.continuum];
          const isHovered = n === d;      
          
          d3.select(nodes[i]).classed('node-hovered', isHovered);
          // .classed('node-hovered', isHovered): adds or removes the class node-hovered based on the boolean isHovered
          // specifies the apperience of nodes that are both HOVERED and SELECTED
          if (isActive) {
            d3.select(nodes[i])
              .style('font-size', isHovered ? '19px' : '17px')  
              .style('font-weight', 'bold');                    
          } else {
          // HOVERED and not SELECTED
            d3.select(nodes[i])
              .style('font-weight', isHovered ? 'bold' : 'normal')  
              .style('font-size', isHovered ? '18px' : '16px');    
          }
        });
      }

      this.tooltip
        .classed('visible', true)
        .html(`${d.data.illustrated || 'unknown'}; ${d.data.dated || 'no info'}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY + 10) + 'px');
    }

    

    private mouseouted() {
      this.link
        .classed('link--target', false)
        .classed('link--source', false);

      this.node
        .classed('node--target', false)
        .classed('node--source', false)
        .classed('node-hovered', false);

      this.tooltip.classed('visible', false);
    }

    


    private packageHierarchy(classes: NodeData[]) {
      const map: { [key: string]: any } = {};
      map[''] = { name: '', children: [] as any[] };
      
      const centuriesMap: { [key: string]: any } = {};

      classes.forEach((d) => {
        const century = d.century || 'Unknown Century';

        if (!centuriesMap[century]) {
          const centuryNode = { name: century, children: [] as any[] };
          centuriesMap[century] = centuryNode;
          map[''].children.push(centuryNode);
        }
        const centuryNodeMap: { [key: string]: any } = {};

        function findInCentury(name: string, data?: NodeData) {
          let node = centuryNodeMap[name];
          if (!node) {
            node = centuryNodeMap[name] = data || { name: name, children: [] as any[] };
            if (name.length) {
              const parentName = name.substring(0, name.lastIndexOf('.'));
              if (parentName) {
                const parentNode = findInCentury(parentName);
                parentNode.children.push(node);
                node.parent = parentNode;
              } else {
                centuriesMap[century].children.push(node);
                node.parent = centuriesMap[century];
              }
              node.key = name.substring(name.lastIndexOf('.') + 1);
            } else {
              centuriesMap[century].children.push(node);
              node.parent = centuriesMap[century];
            }
          }
          return node;
        }

        findInCentury(d.name, d);
      });

      return d3.hierarchy(map['']);
    }


    private packageImports(nodes: d3.HierarchyNode<NodeData>[]) {
      const map: { [key: string]: d3.HierarchyNode<NodeData> } = {};
      const imports: any[] = [];

      nodes.forEach((d) => { map[d.data.name] = d; });

      nodes.forEach((d) => {
        if (d.data.imports) {
          d.data.imports.forEach((i: string) => {
            const targetNode = map[i];
            if (targetNode) {
              const path = map[d.data.name].path(targetNode);
              if (path && path.length > 1) {
                imports.push(path);
              }
            }
          });
        }
      });

      return imports;
    }

    toggleCategorySelection(
      selectedKey: string,
      selectedCategory: string,
      updateCallback: (key: string, category: string) => void
    ): void {
      Object.keys(this.selectionStates).forEach(category => {
        Object.keys(this.selectionStates[category]).forEach(key => {
          this.selectionStates[category][key] = false;
        });
      });
      this.selectionStates[selectedCategory][selectedKey] = true;

      updateCallback(selectedKey, selectedCategory);
    }


    updateGraphColors(category: string): void {
      
      const activeGroups = Object.keys(this.selectionStates[category])
        .filter(key => this.selectionStates[category][key]);
      const defaultLinkColor = '#D3D3D3';

      this.link
        .style('stroke', (d: any) => {
          const sourceGroup = d.source.data[category];
          const targetGroup = d.target.data[category];
          return (activeGroups.includes(sourceGroup) && activeGroups.includes(targetGroup))
            ? '#1f77b4'
            : defaultLinkColor;
        })
        .style('z-index', (d: any) => {
          const sourceGroup = d.source.data[category];
          const targetGroup = d.target.data[category];
          return (activeGroups.includes(sourceGroup) && activeGroups.includes(targetGroup)) ? 1 : 0;
        })
        .raise();

      this.node.each(function (d: any) {
        const groupValue = d.data[category];
        const belongsToActiveGroup = activeGroups.includes(groupValue);
        d3.select(this)
          .style('font-weight', belongsToActiveGroup ? 'bold' : 'normal')
          .style('font-size', '16px')
          .style('fill', belongsToActiveGroup ? '' : '#C0C0C0')
          .style('opacity', 1)
      });
    }



    toggleGroup(category: string, selectedGroup: string): void {
      this.toggleCategorySelection(
        selectedGroup,
        category,
        (key, cat) => this.updateGraphColors(cat)
      );
    }

    
    private hoveredCentury: string | null = null;

    private highlightCenturyNodes(century: string): void {
      this.hoveredCentury = century;
      this.node.each(function (d: any) {
        if (d.data.century === century) {
          d3.select(this)
            .style('font-weight', 'bold');
        }
      });
    }


    private resetNodeStyles(): void {
      if (!this.hoveredCentury) return;
      this.node.each(function () {
        d3.select(this)
          .style('font-weight', 'normal')         
      }); 
       this.node.each((d: any, i, nodes) => {
        const el = d3.select(nodes[i]);

        Object.keys(this.selectionStates).forEach(category => {
          const activeGroups = Object.keys(this.selectionStates[category])
            .filter(key => this.selectionStates[category][key]);

          const groupValue = d.data[category];
          const belongsToActiveGroup = activeGroups.includes(groupValue);
          console.log("active group", belongsToActiveGroup)
           if (belongsToActiveGroup) {
              el
                .style('font-weight', 'bold')                
            } 
        });
      });
      
    };


    renderLegend() {
      console.log("renderLegend called");
      const legendContainer = d3.select('#century-legend');
      legendContainer.selectAll('*').remove();

      const entries = Object.entries(this.centuryColorMap);

      const legendItems = legendContainer.selectAll('.legend-item')
        .data(entries)
        .enter()
        .append('div')
        .attr('class', 'legend-item')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('margin-bottom', '4px')
        .style('cursor', 'pointer')
        .on('mouseover', (event: any, d: any) => this.highlightCenturyNodes(d[0]))
        .on('mouseout', () => this.resetNodeStyles());

      legendItems.append('div')
        .style('width', '14px')
        .style('height', '14px')
        .style('border-radius', '50%')
        .style('margin-right', '8px')
        .style('background-color', ([, color]) => color);

      legendItems.append('span')
        .text(([century]) => century || 'unspecified');
    }
  
    capitalizeFirstLetter(value: string): string {
      if (!value) return value;
      let formatted = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      if (value.toLowerCase().startsWith("sequence") && formatted.length > 1) {
        const lastChar = formatted.charAt(formatted.length - 1).toUpperCase();
        formatted = formatted.slice(0, -1) + lastChar;
      }

      return formatted;
    }
  }
