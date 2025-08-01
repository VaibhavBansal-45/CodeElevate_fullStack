import { useParams } from 'react-router';
import FavoritesPage from '../component/favriotePage';

import ListDetail from '../component/ListDetails';

export default function ListPageRouter() {
  const { id } = useParams();

  if (id === 'favorites') return <FavoritesPage />;
 

  return <ListDetail />;
}
