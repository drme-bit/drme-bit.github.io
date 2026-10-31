'use client';

import { forwardRef, type Ref, type SVGProps } from 'react';
import { LOGO_PATH_D, LOGO_VIEWBOX } from '@/shared/config/logo';

interface LogoMarkProps extends SVGProps<SVGSVGElement> {
  pathClassName?: string;
  pathRef?: Ref<SVGPathElement>;
}

export const LogoMark = forwardRef<SVGSVGElement, LogoMarkProps>(
  function LogoMark({ pathClassName, pathRef, ...rest }, ref) {
    return (
      <svg ref={ref} viewBox={LOGO_VIEWBOX} fill="none" xmlns="http://www.w3.org/2000/svg" {...rest}>
        <path ref={pathRef} className={pathClassName} d={LOGO_PATH_D} fill="currentColor" />
      </svg>
    );
  },
);
