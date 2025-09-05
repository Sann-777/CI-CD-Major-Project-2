// Global type declarations for third-party modules
declare module 'react-rating-stars-component' {
  interface ReactStarsProps {
    count?: number;
    value?: number;
    onChange?: (newRating: number) => void;
    size?: number;
    activeColor?: string;
    color?: string;
    edit?: boolean;
    isHalf?: boolean;
    emptyIcon?: React.ReactElement;
    halfIcon?: React.ReactElement;
    filledIcon?: React.ReactElement;
    a11y?: boolean;
    classNames?: string;
  }

  const ReactStars: React.FC<ReactStarsProps>;
  export default ReactStars;
}

declare module '@/data/homepage-explore' {
  const HomePageExplore: any[];
  export default HomePageExplore;
}

// Extend Array prototype for ES2022 features
interface Array<T> {
  at(index: number): T | undefined;
}
