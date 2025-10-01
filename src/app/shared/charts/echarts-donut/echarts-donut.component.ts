import { Component, Input, signal, effect } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

@Component({
  standalone: true,
  selector: 'echarts-donut',
  imports: [NgxEchartsModule],
  template: `<div echarts [options]="opts()" class="h-56"></div>`
})
export class EchartsDonutComponent {
  @Input() data: { name: string; value: number }[] = [];
  @Input() centerText = '';

  opts = signal<EChartsOption>({});
  constructor() {
    effect(() => {
      const total = this.data.reduce((a, b) => a + b.value, 0) || 1;
      this.opts.set({
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie', radius: ['60%', '80%'], avoidLabelOverlap: true,
          itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
          label: { show: false }, labelLine: { show: false }, data: this.data
        }],
        graphic: [{
          type: 'text', left: 'center', top: 'center',
          style: { text: this.centerText || Math.round((this.data[0]?.value||0)/total*100)+'%', textAlign:'center', fontSize: 18 }
        }]
      });
    });
  }
}
