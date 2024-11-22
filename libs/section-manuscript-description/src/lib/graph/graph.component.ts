import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as d3 from 'd3';

interface NodeData {
  name: string;
  size?: number;
  imports?: string[];
  century?: string;
  continuum?: string;
}

@Component({
  selector: 'kalila-edition-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GraphComponent implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: true })
  chartContainer!: ElementRef;

  private link!: d3.Selection<SVGPathElement, any, SVGGElement, unknown>;
  private node!: d3.Selection<SVGTextElement, d3.HierarchyNode<NodeData>, SVGGElement, unknown>;

  selectedContinuums: { [key: string]: boolean } = {
    'early group': false,
    'london continuum': false,
    'paris continuum': false,
    'iberian continuum': false,
    'queen continuum': false,
    'cross copy': false,
  };

  continuumGroups = [
    'early group',
    'london continuum',
    'paris continuum',
    'iberian continuum',
    'queen continuum',
    'cross copy',
  ];

  private centuryColorMap: { [key: string]: string } = {
    '13th century': '#1f77b4',
    '14th century': '#1f77b4',
    '15th century': '#1f77b4',
    '16th century': '#1f77b4',
    '17th century': '#1f77b4',
    '18th century': '#1f77b4',
    '19th century': '#1f77b4',
    '20th century': '#1f77b4',
    '': '#1f77b4',
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
      const graphData: NodeData[] = data['graphData'];
      console.log('Resolved Graph Data:', graphData);
      this.renderGraph(graphData);
    });
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
    cluster(root);

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
      .on('mouseover', this.mouseovered.bind(this))
      .on('mouseout', this.mouseouted.bind(this));
  }

  private mouseovered(d: any) {
    this.node.each((n: any) => { n.target = n.source = false; });

    this.link
      .classed('link--target', (l: any) => {
        if (l.target.data === d.target.__data__.data) {
          l.source.source = true;
          return true;
        }
        return false;
      })
      .classed('link--source', (l: any) => {
        if (l.source.data === d.target.__data__.data) {
          l.target.target = true;
          return true;
        }
        return false;
      })
      .filter((l: any) => l.target.data === d || l.source.data === d)
      .raise();

    this.node
      .classed('node--target', (n: any) => n.target)
      .classed('node--source', (n: any) => n.source);
  }

  private mouseouted() {
    this.link
      .classed('link--target', false)
      .classed('link--source', false);

    this.node
      .classed('node--target', false)
      .classed('node--source', false);
  }

  private packageHierarchy(classes: NodeData[]) {
    const map: { [key: string]: any } = {};

    function find(name: string, data?: NodeData) {
      let node = map[name];
      if (!node) {
        node = map[name] = data || { name: name, children: [] as NodeData[] };
        if (name.length) {
          node.parent = find(name.substring(0, name.lastIndexOf('.')));
          node.parent.children.push(node);
          node.key = name.substring(name.lastIndexOf('.') + 1);
        }
      }
      return node;
    }

    classes.forEach((d: NodeData) => find(d.name, d));
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

  toggleLinks(selectedGroup: string): void {
    // Clear all other selections if a checkbox is checked
    Object.keys(this.selectedContinuums).forEach(group => {
      this.selectedContinuums[group] = (group === selectedGroup);
    });

    const isAnyGroupSelected = Object.values(this.selectedContinuums).some(value => value);

    if (isAnyGroupSelected) {
      this.updateGraphColors(selectedGroup);
    } else {
      // Default style when no group is selected
      this.link.style('stroke', '#1f77b4').style('stroke-opacity', 1);
      this.node.style('fill', '#1f77b4').style('font-weight', 'normal').style('opacity', 1);
    }
  }

  updateGraphColors(selectedGroup: string): void {
    const activeGroups = [selectedGroup];
    const defaultLinkColor = '#D3D3D3';

    this.link
      .style('stroke', (d: any) => {
        const continuum = d.source.data.continuum;
        return activeGroups.includes(continuum) ? '#1f77b4' : defaultLinkColor;
      })
      .style('z-index', (d: any) => {
        // If the link belongs to the active group, set z-index to 4
        return activeGroups.includes(d.source.data.continuum) ? 1 : 0;
      })
      .raise(); // This brings the selected links to the front

    this.node.each(function (d: any) {
      const belongsToActiveGroup = activeGroups.includes(d.data.continuum);
      d3.select(this)
        .style('font-weight', belongsToActiveGroup ? 'bold' : 'normal')
        .style('font-size', belongsToActiveGroup ? '16px' : '12px')
        .style('fill', belongsToActiveGroup ? '#1f77b4' : '#C0C0C0')
        .style('opacity', belongsToActiveGroup ? 1 : 1);
    });
  }

  capitalizeFirstLetter(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
