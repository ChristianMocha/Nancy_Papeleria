import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  ViewChild,
  ElementRef,
  input,
  output,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-pattern-lock',
  imports: [CommonModule],
  templateUrl: './pattern-lock.component.html',
  styleUrl: './pattern-lock.component.scss',
})
export class PatternLockComponent {
  public size = input<number>(300);
  public dotRadius = input<number>(12);
  public pattern = output<number[]>();
  public patternInput = input<any>();

  @ViewChild('svgEl') svgEl!: ElementRef<SVGSVGElement>;

  circles: any[] = [];
  points: any[] = [];
  private pendingPattern: number[] | null = null;

  polylinePoints = '';

  isDrawing = false;

  ngAfterViewInit() {
    this.buildGrid();
    this.bindEvents();

    if (this.pendingPattern) {
      setTimeout(() => {
        this.loadPattern(this.pendingPattern!);
        this.pendingPattern = null;
      });
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patternInput'] && this.patternInput()) {
      const ids = this.patternInput()
        .toString()
        .split('-')
        .map(Number)
        .filter((n: any) => !isNaN(n));

      // Si aún no existe el grid, guarda y espera
      if (this.circles.length === 0) {
        this.pendingPattern = ids;
        return;
      }

      setTimeout(() => {
        this.loadPattern(ids);
      });
    }
  }

  private loadPattern(ids: number[]) {
    this.points = ids
      .map((id) => this.circles.find((c) => c.id === id))
      .filter(Boolean);

    this.updateLine();
  }

  buildGrid() {
    const step = this.size() / 4;
    let index = 1;

    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col <= 3; col++) {
        this.circles.push({
          id: index++,
          x: col * step,
          y: row * step,
        });
      }
    }
  }

  bindEvents() {
    const svg = this.svgEl.nativeElement;

    svg.addEventListener('mousedown', (e) => this.start(e));
    svg.addEventListener('mousemove', (e) => this.move(e));
    svg.addEventListener('mouseup', () => this.end());
    svg.addEventListener('mouseleave', () => this.end());
  }

  start(e: MouseEvent) {
    this.isDrawing = true;
    this.points = [];
    this.polylinePoints = '';
    this.handlePoint(e);
  }

  move(e: MouseEvent) {
    if (!this.isDrawing) return;
    this.handlePoint(e);
  }

  end() {
    if (!this.isDrawing) return;

    this.isDrawing = false;

    const patternIds = this.points.map((p) => p.id);
    this.pattern.emit(patternIds);
  }

  handlePoint(e: MouseEvent) {
    const svg = this.svgEl.nativeElement;
    const pt = svg.createSVGPoint();

    pt.x = e.clientX;
    pt.y = e.clientY;

    const cursor = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    for (let c of this.circles) {
      const dx = cursor.x - c.x;
      const dy = cursor.y - c.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // sensiblidad para detectar cuando toca un punto
      if (distance < 25) {
        if (!this.points.find((p) => p.id === c.id)) {
          this.points.push(c);
          this.updateLine();
        }
      }
    }
  }

  updateLine() {
    this.polylinePoints = this.points.map((p) => `${p.x},${p.y}`).join(' ');
  }

  clear() {
    this.points = [];
    this.polylinePoints = '';
    this.pattern.emit([]);
  }
}
