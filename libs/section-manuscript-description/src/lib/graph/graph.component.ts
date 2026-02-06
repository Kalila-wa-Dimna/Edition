  import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import * as d3 from 'd3';

  interface NodeData {
    name: string;
    size?: number;
    imports?: string[];
    century?: string;
    continuum?: string[];
    copy_group?: string;
    sequence?: string;
    structural?: string[];
    [key: string]: any;
    
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
        'wetzstein group' : false,
        'iberian continuum': false,
        'queen continuum': false,
        'cross copy': false,
        '':false
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
        'Arch. Mus. EY 344': false,
        'Copies of Editions': false,
        '':false
      },
      sequence: {
        'sequence A': false,
        'sequence B': false,
        'sequence C': false,
        'sequence D' : false,
        'sequence E': false,
        'sequence F': false,
        'sequence G': false,
        'sequence H': false,
        '':false
      },
      century: {
        '10th - 13th century': false, 
        '13th century': false,
        '14th century': false,
        '15th century': false,
        '16th century': false,
        '17th century': false,
        '18th century': false,
        '19th century': false,
        '20th century': false,
        'unspecified': false,
      },
      structural: {
        'First Risāla': false,
        'Sv preface': false,
        'As preface': false,
        'Km chapter': false,
        'Kw chapter': false,
        'Df chapter': false,
        '': false
      }
    };


  groupCategories: { [category: string]: string[] } = {
    continuum: [
      'early group',
      'london continuum',
      'paris continuum',
      'wetzstein group',
      'iberian continuum',
      'queen continuum',
      'cross copy',
      ''
    ],
    copy_group: [
      'Arch. Mus. EY 344',
      'Ayasofya 4214',
      'Copies of Editions',
      'Hamburg 170',
      'München 618',
      'Paris 2789',
      'Paris 3465',
      'Paris 3468',
      'Paris 3471',
      'Pococke 400',
      'Princeton 169H',
      'Riyadh 2536',
      'Tunis 16030',
      ''
    ],
    sequence: [
      'sequence A',
      'sequence B',
      'sequence C',
      'sequence D',
      'sequence E',
      'sequence F',
      'sequence G',
      'sequence H',
      ''      
    ],
    century: [
        '10th - 13th century',
        '13th century',
        '14th century',
        '15th century',
        '16th century',
        '17th century',
        '18th century',
        '19th century',
        '20th century',
        'unspecified' 
      ],
    structural: [
        'First Risāla',
        'Sv preface',
        'As preface',
        'Km chapter',
        'Kw chapter',
        'Df chapter',
        '' 
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
    currentMatchingNodes = new Set<string>();

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
      this.route.data.subscribe(data => {
        this.graphData = data['graphData']
        console.log('Resolved Graph Data:', this.graphData);
        this.renderGraph(this.graphData);
      });
    }

    resetGraph(): void {
      Object.keys(this.selectionStates).forEach(category => {
      Object.keys(this.selectionStates[category]).forEach(key => {
        this.selectionStates[category][key] = false;
      });
      console.log(Object)
      }); 
        this.possibleOptions = {};
        Object.keys(this.groupCategories).forEach(category => {
          this.possibleOptions[category] = new Set(this.groupCategories[category]);
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
        .attr('fill', '#1b5690')
        .text((d: any) => d.data.name)
        .on('mouseover', (event: any, d: any) => this.mouseovered(event, d))
        .on('mouseout', this.mouseouted.bind(this));

      
    }

    possibleOptions: { [category: string]: Set<string> } = {
      continuum: new Set(this.groupCategories['continuum']),
      copy_group: new Set(this.groupCategories['copy_group']),
      sequence: new Set(this.groupCategories['sequence']),
      century: new Set(this.groupCategories['century']),
      structural: new Set(this.groupCategories['structural'])
    };

    updatePossibleOptions() {

        const activeSelections: { [category: string]: Set<string> } = {};
        console.log("activeSelections1", activeSelections)
        Object.keys(this.selectionStates).forEach(cat => {
          const selected = Object.keys(this.selectionStates[cat])
            .filter(g => this.selectionStates[cat][g]);
          activeSelections[cat] = new Set(selected);
        });
        console.log("activeSelections2", activeSelections)
        
        //// come back here
        // the nodes aren´t blue, figure out why
        const hasAnySelection = Object.values(activeSelections)
        .some(set => set.size > 0);

          if (!hasAnySelection) {   
            this.currentMatchingNodes.clear();
            this.resetGraph();
            return this.possibleOptions;
          }

        let matchingNodes = this.graphData;

        Object.keys(activeSelections).forEach(cat => {
          if (activeSelections[cat].size > 0) {

            matchingNodes = matchingNodes.filter(n => {
              const nodeValue = n[cat];

              if (Array.isArray(nodeValue)) {
                return [...activeSelections[cat]].every(sel =>
                  nodeValue.includes(sel)
                );
              }
              return activeSelections[cat].has(nodeValue);
            });
          }
        });

        
        this.currentMatchingNodes = new Set(
          matchingNodes.map(n => n.name)
        );

        console.log(
          'Matching nodes:',
          [...this.currentMatchingNodes]
        );

      
        Object.keys(this.possibleOptions).forEach(cat => {

          const compatibleValues = new Set<string>();

          matchingNodes.forEach(node => {
            const value = node[cat];

            if (Array.isArray(value)) {
              value.forEach(v => compatibleValues.add(v));
            } else {
              compatibleValues.add(value);
            }
          });

          this.possibleOptions[cat] = compatibleValues;
        });

        console.log(
          'Possible options:',
          Object.fromEntries(
            Object.entries(this.possibleOptions).map(([k, v]) => [k, [...v]])
          )
        );

        return this.possibleOptions;
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
        // clear previous hover

      this.node.classed('node-hovered', false);

      // only style the hovered node
      const hovered = this.node.filter(n => n === d);

      hovered
        .classed('node-hovered', true)
        .style('font-weight', 'bold')
        .style('font-size', '19px');

          
      }

      this.tooltip
        .classed('visible', true)
        .html(`${d.data.illustrated || 'unknown'}; ${d.data.dated || 'no info'}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY + 10) + 'px');
    }

    

    private mouseouted() {
      // Remove link hover classes
      this.link
        .classed('link--target', false)
        .classed('link--source', false);

      // Remove node hover classes
      this.node
        .classed('node--target', false)
        .classed('node--source', false)
        .classed('node-hovered', false)
        // IMPORTANT: clear inline hover styles
        .style('font-size', null)
        .style('font-weight', null);

      // Re-apply selection-based styling
      this.updateGraphColors();

      // Hide tooltip
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


   
  updateGraphColors(): void {
    if (this.currentMatchingNodes.size === 0) {
      this.node
        .style('font-weight', 'normal')
        .style('font-size', '16px')
        .style('fill', '#1b5690')
        .style('opacity', 1);

      this.link
        .style('stroke', '#D3D3D3');

      return;
    }

    const defaultLinkColor = '#D3D3D3';

    // Helper to test if a node matches ALL category constraints
     const isNodeValid = (node: any) => {
      return this.currentMatchingNodes.has(node.data.name);
    };

    // ---- Highlight links ----
    this.link
      .style('stroke', (d: any) => {
        const sourceValid = isNodeValid(d.source);
        const targetValid = isNodeValid(d.target);
        return (sourceValid && targetValid)
          ? '#1f77b4'
          : defaultLinkColor;
      })
      .style('z-index', (d: any) => {
        const sourceValid = isNodeValid(d.source);
        const targetValid = isNodeValid(d.target);
        return (sourceValid && targetValid) ? 1 : 0;
      })
      .raise();

    // ---- Highlight nodes ----
    this.node.each(function (d: any) {
      const valid = isNodeValid(d);

      d3.select(this)
        .style('font-weight', valid ? 'bold' : 'normal')
        .style('font-size', '16px')
        .style('fill', valid ? '#1b5690' : '#C0C0C0')
        .style('opacity', 1);
    });
  }



    toggleGroup(category: string, selectedGroup: string): void {
      const current = this.selectionStates[category][selectedGroup];
      this.selectionStates[category][selectedGroup] = !current;

      this.updatePossibleOptions();
      this.updateGraphColors();
    }



    capitalizeFirstLetter(value: string, category?: string): string {
      if (!value) return value;
   
      if (value === 'First Risāla' || value === 'Arch. Mus. EY 344' || value === 'Copies of Editions')   
        return value;     
   
      let formatted =
        value.charAt(0).toUpperCase() +
        value.slice(1).toLowerCase();

      if (value.toLowerCase().startsWith('sequence') && formatted.length > 1) {
        const lastChar = formatted.charAt(formatted.length - 1).toUpperCase();
        formatted = formatted.slice(0, -1) + lastChar;
      }

      return formatted;
    }

     formatGroupLabel(value: string): { before: string; risala: string; after: string } | null {
        if (!value) return null;

        const match = value.match(/(.*?)(Risāla)(.*)/i);
        if (!match) return null;

        return {
          before: match[1],
          risala: match[2],
          after: match[3]
        };
      }

  }
