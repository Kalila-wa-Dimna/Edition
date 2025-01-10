/* eslint-disable @typescript-eslint/no-explicit-any */
import { citiesAndLanguages } from './../data/cities-and-languages';
import { worldCities } from './../data/world-cities';
import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  Inject,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';
import * as d3 from 'd3';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { continentsSmall } from '../data/continents-small';
import { DisseminationHistoryService } from '../dissemination-history.service';
import { MapPhase } from '../data/map-phases';
import { Arrows } from '../data/arrows';
@Component({
    selector: 'kd-dissemination-history-map',
    templateUrl: './dissemination-history-map.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./dissemination-history-map.component.scss'],
    standalone: false
})
export class DisseminationHistoryMapComponent implements OnInit, OnDestroy {
  private container!: d3.Selection<d3.BaseType, any, any, any>;
  private svg!: d3.Selection<SVGSVGElement, any, HTMLElement, any>;
  private projection!: d3.GeoProjection;
  private geoPath!: d3.GeoPath<any, d3.GeoPermissibleObjects>;
  private globe!: d3.Selection<SVGGElement, any, HTMLElement, any>;
  private zoom!: d3.ZoomBehavior<Element, any>;
  private cities: any;
  private map: any;
  private resizeSubscription!: Subscription;
  private phaseSubscription!: Subscription;
  private width = 1;
  private height = 1;
  private transitionDelay = 1000;

  constructor(
    private hostElement: ElementRef,
    private disseminationHistoryService: DisseminationHistoryService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.container = d3
        .select(this.hostElement.nativeElement)
        .select('#map-svg-container');
      this.createMap();
      this.getDimensionsFromParentNode();
      this.resizeSubscription = fromEvent(window, 'resize')
        .pipe(debounceTime(100))
        .subscribe(() => this.onResize());
      this.phaseSubscription =
        this.disseminationHistoryService.phase$.subscribe((p) =>
          this.changePhase(p)
        );
    }
  }

  private getDimensionsFromParentNode() {
    if (this.container) {
      const node = this.container.node() as Element | null;
      if (node !== null) {
        this.width = node.clientWidth;
        this.height = (this.width * 9) / 16;
      }
    }
  }

  private onResize(): void {
    this.getDimensionsFromParentNode();
    this.container.style('height', `${this.height}px`);
  }

  private createMap() {
    this.createSvg();
    this.createGeoPath();
    this.prepareGeoData();
    this.drawGeoPath();
  }

  private createSvg() {
    this.svg = this.container
      .append('svg')
      .attr('width', '100%')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('viewBox', '0 0 1600 900');

    this.zoom = d3
      .zoom()
      .scaleExtent([1, 30])
      .translateExtent([
        [0, 0],
        [this.width, this.height],
      ])
      .on('zoom', (e) => {
        this.globe.attr('transform', e.transform);
      });
  }

  private createGeoPath() {
    this.projection = d3
      .geoMercator()
      .scale(445)
      .center([50, 50])
      .rotate([25, 0, 0]);
    this.geoPath = d3.geoPath().projection(this.projection);
  }

  private prepareGeoData() {
    const testParseCities: any = d3.csvParse(worldCities);
    this.map = { features: JSON.parse(continentsSmall).features };
    this.cities = testParseCities.filter((item: any) =>
      Object.keys(citiesAndLanguages).includes(item.city_ascii)
    );
  }

  private drawGeoPath() {
    this.globe = this.svg.append('g');
    this.globe
      .selectAll('path.country')
      .data(this.map.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('id', (d: any) => d.id)
      .attr('d', (d: any) => this.geoPath(d));

    this.globe
      .selectAll('text')
      .data(this.cities)
      .enter()
      .append('svg:text')
      .text((d: any) => citiesAndLanguages[d.city_ascii])
      .attr('x', (d: any) => this.projection([d.lng, d.lat])![0] + 4)
      .attr('y', (d: any) => this.projection([d.lng, d.lat])![1] + 4)
      .attr('text-anchor', 'middle')
      .attr('id', (d: any) => d.city_ascii)
      .attr('font-size', '12pt')
      .attr('font-weight', 'bold')
      .attr('fill', 'white') // todo make dark and light styles
      .attr('visibility', 'hidden');
  }

  private changePhase(step: MapPhase) {
    const resetZoom = d3.zoomIdentity.translate(0, -15).scale(1.2);

    const toIndia = d3.zoomIdentity.translate(-1900, -1200).scale(3);
    const toIndiaIran = d3.zoomIdentity.translate(-1500, -1100).scale(2.9);
    const toIndiaIranArabia = d3.zoomIdentity
      .translate(-1200, -1000)
      .scale(2.7);
    const toEuropeAndNearEast = d3.zoomIdentity
      .translate(-480, -500)
      .scale(2.5);
    const toEurope = d3.zoomIdentity.translate(0, 0).scale(1.5);
    const toNearEast = d3.zoomIdentity.translate(-400, -380).scale(1.5);

    const transition = this.svg
      .transition()
      .duration(this.transitionDelay) as d3.TransitionLike<SVGSVGElement, any>;

    const applyZoom = (zoomState: d3.ZoomTransform) =>
      this.zoom.transform(transition, zoomState);

    const phase4Cities = [
      'Mashhad',
      'Rome',
      'Florence',
      'Edirne',
      'Madrid',
      'Belgrade',
      'Yerevan',
    ];
    const phase5EuropeCities = [
      'Stuttgart',
      'Bursa',
      'Berlin',
      'Paris',
      'Stockholm',
      'Tbilisi',
      'Warsaw',
      'Budapest',
      'Kobenhavn',
      'Reykjavik',
      'Amsterdam',
      'Prague',
      'Milan',
      'Agadir',
      'London',
      'Kazan',
      'Oslo',
      'Moscow',
    ];
    const phase5NearEastCities = [
      'Agra',
      'Ulaanbaatar',
      'Karachi',
      'Dhaka',
      // "Kabul",
      'Khost',
      'Qarshi',
      'Aksum',
      'Kochi',
      'Kuala Lumpur',
      'Jakarta',
      'Surabaya',
    ];

    let lines;

    switch (step) {
      case MapPhase.sources:
        applyZoom(toIndia);
        DisseminationHistoryMapComponent.addLanguage('Nagpur');
        break;
      //-----------------------------------------------------------------//
      case MapPhase['persian-redaction']:
        applyZoom(toIndiaIran);
        DisseminationHistoryMapComponent.addLanguage('Yazd');
        this.addline('Nagpur-Yazd', 2);
        break;
      //-----------------------------------------------------------------//
      case MapPhase.syriac:
        applyZoom(toIndiaIranArabia);
        DisseminationHistoryMapComponent.addLanguage('Sanliurfa');
        this.addline('Yazd-Sanliurfa', 3);
        break;
      //-----------------------------------------------------------------//
      case MapPhase.arabic:
        DisseminationHistoryMapComponent.addLanguage('Baghdad');
        this.addline('Yazd-Baghdad', 3);
        this.addline('Baghdad-Sanliurfa', 3);
        break;
      //-----------------------------------------------------------------//
      case MapPhase.medieval:
        applyZoom(toEuropeAndNearEast);
        phase4Cities.forEach((cityName) =>
          DisseminationHistoryMapComponent.addLanguage(cityName)
        );
        lines = Object.values(Arrows).filter((item) => item.phase === 4);
        lines.forEach((item) => this.addline(item.path, 4));
        break;
      //-----------------------------------------------------------------//
      case MapPhase['inside-europe']:
        applyZoom(toEurope);
        phase5EuropeCities.forEach((cityName) =>
          DisseminationHistoryMapComponent.addLanguage(cityName)
        );
        lines = Object.values(Arrows).filter((item) => item.phase === 5);
        lines.forEach((item) => this.addline(item.path, 5));
        break;
      //-----------------------------------------------------------------//
      case MapPhase['into-asia-africa']:
        applyZoom(toNearEast);
        phase5NearEastCities.forEach((cityName) =>
          DisseminationHistoryMapComponent.addLanguage(cityName)
        );
        lines = Object.values(Arrows).filter((item) => item.phase === 6);
        lines.forEach((item) => this.addline(item.path, 6));
        break;
      //-----------------------------------------------------------------//
      case MapPhase.conclusion:
        applyZoom(resetZoom);
        break;
      //-----------------------------------------------------------------//
      case MapPhase.intro:
      default:
        applyZoom(resetZoom);
        [
          'Nagpur',
          'Yazd',
          'Baghdad',
          'Sanliurfa',
          ...phase5NearEastCities,
          ...phase5EuropeCities,
          ...phase4Cities,
        ].forEach((cityName) =>
          DisseminationHistoryMapComponent.hideLanguage(cityName)
        );
        this.removeLines();
        break;
    }
  }

  static addLanguage(cityName: string) {
    const el = document.getElementById(cityName);
    el!.setAttribute('visibility', 'visible');
  }

  static hideLanguage(cityName: string) {
    const el = document.getElementById(cityName);
    el!.setAttribute('visibility', 'hidden');
  }

  addline(lineId: string, step: MapPhase) {
    const arrowHead = step === 2 ? 10 : step === 3 ? 8 : step === 4 ? 6 : 5;
    const arrowPoints: [number, number][] = [
      [0, 0],
      [0, 2 * arrowHead],
      [2 * arrowHead, arrowHead],
    ];

    const color =
      step === 2
        ? 'rgba(0, 0, 0, .6)'
        : step === 3
        ? 'rgba(244, 132, 110, .6)'
        : step === 4
        ? 'rgba(240, 222, 57, .6)'
        : 'rgba(107, 158, 31, .6)';

    this.globe
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', `${lineId}`)
      .attr('class', 'arrow-head')
      .attr('fill', color)
      .attr('refX', arrowHead)
      .attr('refY', arrowHead)
      .attr('markerWidth', 30)
      .attr('markerHeight', 30)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', d3.line()(arrowPoints));

    this.globe
      .append('g')
      .datum(this.lineString(lineId))
      .attr('class', 'arrow')
      .append('path')
      .attr('d', ({ coordinates, type }) => {
        coordinates[1] = [coordinates[1][0] + 3.5, coordinates[1][1]];
        return this.geoPath({ coordinates, type });
      })
      .each(function (d) {
        d.totalLength = this.getTotalLength();
      })
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .style('stroke-dasharray', (d) => d.totalLength)
      .style('stroke-dashoffset', (d) => d.totalLength)
      .attr('class', `orthodome-p${Arrows[lineId].phase}`)
      .transition()
      .delay(4000)
      .attr('marker-end', `url(#${lineId})`);
  }

  lineString(
    lineId: string
  ): GeoJSON.LineString & { id: string; totalLength: number } {
    const d = Arrows[lineId];
    return {
      id: d.id,
      type: 'LineString',
      coordinates: d.coordinates,
      totalLength: 0,
    };
  }

  removeLines() {
    this.globe.selectAll('g.arrow').remove();
  }

  ngOnDestroy() {
    if (this.resizeSubscription) {
      this.resizeSubscription.unsubscribe();
    }

    if (this.phaseSubscription) {
      this.phaseSubscription.unsubscribe();
    }
  }
}
