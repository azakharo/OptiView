declare module 'react-responsive-masonry' {
  import {ReactNode} from 'react';

  interface MasonryProps {
    children: ReactNode;
    columnsCount?: number;
    columnsCountBreakPoints?: Record<number, number>;
    gutter?: string;
    className?: string;
    style?: React.CSSProperties;
  }

  const Masonry: React.FC<MasonryProps>;
  export default Masonry;
}
