import type { SVGProps } from 'react';

interface AssistantAvatarProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
  size?: number;
}

/*  The assistant's visual mark: a small spark rather than a character. It
    reads as "AI helper" without implying a separate persona or mascot.  */
export default function AssistantAvatar({ size = 20, ...props }: AssistantAvatarProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M11.4 2.4c.5 4.5 2.6 6.6 7.1 7.1-4.5.5-6.6 2.6-7.1 7.1-.5-4.5-2.6-6.6-7.1-7.1 4.5-.5 6.6-2.6 7.1-7.1Z"
        fill="currentColor"
      />
      <path
        d="M18.3 14.4c.25 2.2 1.3 3.25 3.5 3.5-2.2.25-3.25 1.3-3.5 3.5-.25-2.2-1.3-3.25-3.5-3.5 2.2-.25 3.25-1.3 3.5-3.5Z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}
