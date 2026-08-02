import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'weatherWidget',
  standalone: false
})
export class WeatherWidgetPipe implements PipeTransform {
  transform(value: number | string | undefined | null, type: string): string {
    const numValue = Number(value) || 0;
    const basePath = 'assets/widgets/';

    switch (type) {
      case 'viento':
        if (numValue < 5) return `${basePath}calma.jpg`;
        if (numValue >= 5 && numValue < 30) return `${basePath}viento_moderado.jpg`;
        return `${basePath}viento_fuerte.jpg`;

      case 'humedad':
        if (numValue < 35) return `${basePath}humedad_baja.jpg`;
        if (numValue >= 35 && numValue <= 75) return `${basePath}humedad_normal.jpg`;
        return `${basePath}humedad_alta.jpg`;

      case 'uv':
        if (numValue <= 2) return `${basePath}uv_bajo.jpg`;
        if (numValue >= 3 && numValue <= 5) return `${basePath}uv_moderado.jpg`;
        if (numValue === 6 || numValue === 7) return `${basePath}uv_alto.jpg`;
        if (numValue >= 8 && numValue <= 10) return `${basePath}uv_muy_alto.jpg`;
        return `${basePath}uv_extremo.jpg`;

      case 'suelo':
        if (numValue < 10) return `${basePath}suelo_seco.jpg`; // Asumiendo % de 0 a 100
        if (numValue >= 10 && numValue <= 30) return `${basePath}suelo_humedo.jpg`;
        return `${basePath}suelo_encharcado.jpg`;

      case 'sensacion':
        return `${basePath}termometro.jpg`;
      case 'prob_lluvia':
        return `${basePath}lluvia_prob.jpg`;

      default:
        return `${basePath}default.jpg`;
    }
  }
}
