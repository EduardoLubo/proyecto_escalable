import  { Suspense } from 'react';
import Spinner from 'src/views/spinner/Spinner';

const Loadable = (Component) => (props) =>
  (
    <Suspense fallback={<Spinner />}>
      <Component {...props} />
    </Suspense>
  );

export default Loadable;
