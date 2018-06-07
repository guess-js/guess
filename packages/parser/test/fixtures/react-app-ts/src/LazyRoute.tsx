import * as React from 'react';
import * as Loadable from 'react-loadable';

const loading = ({ isLoading, error }: { isLoading: boolean; error: Error }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>Sorry, there was a problem loading the page.</div>;
  } else {
    return null;
  }
};

export const AsyncComponent = (loader: any) => Loadable({ loader, loading });
