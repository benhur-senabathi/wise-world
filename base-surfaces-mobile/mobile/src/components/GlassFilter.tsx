import { useEffect, useRef, useState } from 'react';
import {
  calculateDisplacementMap,
  calculateDisplacementMap2,
  calculateDisplacementMapWithShape,
  type ShapeType,
} from '../lib/displacementMap';
import { calculateRefractionSpecular } from '../lib/specular';
import { calculateMagnifyingDisplacementMap } from '../lib/magnifyingDisplacement';
import { CONVEX, CONCAVE, CONVEX_CIRCLE, LIP } from '../lib/surfaceEquations';

export interface GlassFilterProps {
  id: string;
  width?: number;
  height?: number;
  radius?: number;
  bezelWidth?: number;
  glassThickness?: number;
  refractiveIndex?: number;
  bezelType?: 'convex_circle' | 'convex_squircle' | 'concave' | 'lip';
  blur?: number;
  scaleRatio?: number;
  specularOpacity?: number;
  specularSaturation?: number;
  magnify?: boolean;
  magnifyingScale?: number;
  shape?: ShapeType;
  cornerRadius?: number;
  squircleExponent?: number;
  quality?: number;
}

function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

function getSurfaceFn(bezelType: string) {
  switch (bezelType) {
    case 'convex_circle': return CONVEX_CIRCLE.fn;
    case 'convex_squircle': return CONVEX.fn;
    case 'concave': return CONCAVE.fn;
    case 'lip': return LIP.fn;
    default: return CONVEX.fn;
  }
}

export function GlassFilter({
  id,
  width = 150,
  height = 150,
  radius = 75,
  bezelWidth = 40,
  glassThickness = 120,
  refractiveIndex = 1.5,
  bezelType = 'convex_squircle',
  blur = 0.2,
  scaleRatio = 1,
  specularOpacity = 0.4,
  specularSaturation = 4,
  magnify = false,
  magnifyingScale = 24,
  shape = 'pill',
  cornerRadius = 1.0,
  squircleExponent = 2,
  quality = 2,
}: GlassFilterProps) {
  const [displacementMapUrl, setDisplacementMapUrl] = useState('');
  const [specularMapUrl, setSpecularMapUrl] = useState('');
  const [magnifyingMapUrl, setMagnifyingMapUrl] = useState('');
  const [maxDisplacement, setMaxDisplacement] = useState(0);
  const regenerateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (regenerateTimeout.current) {
      clearTimeout(regenerateTimeout.current);
    }
    regenerateTimeout.current = setTimeout(() => {
      const surfaceFn = getSurfaceFn(bezelType);

      const precomputedMap = calculateDisplacementMap(
        glassThickness,
        bezelWidth,
        surfaceFn,
        refractiveIndex
      );

      const maxDisp = Math.max(...precomputedMap.map(x => Math.abs(x))) || 1;
      setMaxDisplacement(maxDisp);

      let displacementImageData: ImageData;

      if (shape && shape !== 'circle') {
        displacementImageData = calculateDisplacementMapWithShape(
          width, height, width, height,
          bezelWidth, 100, precomputedMap,
          shape, cornerRadius, squircleExponent, quality
        );
      } else {
        displacementImageData = calculateDisplacementMap2(
          width, height, width, height,
          radius, bezelWidth, 100, precomputedMap, quality
        );
      }

      setDisplacementMapUrl(imageDataToDataUrl(displacementImageData));

      const specularImageData = calculateRefractionSpecular(
        width, height, radius, bezelWidth, undefined, quality
      );
      setSpecularMapUrl(imageDataToDataUrl(specularImageData));

      if (magnify) {
        const magnifyingImageData = calculateMagnifyingDisplacementMap(width, height, quality);
        setMagnifyingMapUrl(imageDataToDataUrl(magnifyingImageData));
      }
    }, 16);

    return () => {
      if (regenerateTimeout.current) clearTimeout(regenerateTimeout.current);
    };
  }, [width, height, radius, bezelWidth, glassThickness, refractiveIndex, bezelType, magnify, shape, cornerRadius, squircleExponent, quality]);

  const scale = maxDisplacement * scaleRatio;

  return (
    <svg colorInterpolationFilters="sRGB" style={{ display: 'none' }}>
      <defs>
        <filter id={id}>
          {magnify && magnifyingMapUrl && (
            <>
              <feImage
                href={magnifyingMapUrl}
                x="0" y="0"
                width={width} height={height}
                result="magnifying_displacement_map"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="magnifying_displacement_map"
                scale={magnifyingScale}
                xChannelSelector="R"
                yChannelSelector="G"
                result="magnified_source"
              />
            </>
          )}

          <feGaussianBlur
            in={magnify ? 'magnified_source' : 'SourceGraphic'}
            stdDeviation={blur}
            result="blurred_source"
          />

          {displacementMapUrl && (
            <feImage
              href={displacementMapUrl}
              x="0" y="0"
              width={width} height={height}
              result="displacement_map"
            />
          )}
          <feDisplacementMap
            in="blurred_source"
            in2="displacement_map"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />

          <feColorMatrix
            in="displaced"
            type="saturate"
            values={specularSaturation.toString()}
            result="displaced_saturated"
          />

          {specularMapUrl && (
            <feImage
              href={specularMapUrl}
              x="0" y="0"
              width={width} height={height}
              result="specular_layer"
            />
          )}
          <feComposite
            in="displaced_saturated"
            in2="specular_layer"
            operator="in"
            result="specular_saturated"
          />
          <feComponentTransfer in="specular_layer" result="specular_faded">
            <feFuncA type="linear" slope={specularOpacity} />
          </feComponentTransfer>

          <feBlend
            in="specular_saturated"
            in2="displaced"
            mode="normal"
            result="withSaturation"
          />
          <feBlend
            in="specular_faded"
            in2="withSaturation"
            mode="normal"
          />
        </filter>
      </defs>
    </svg>
  );
}
