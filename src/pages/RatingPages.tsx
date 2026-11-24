import { ratingApi } from '../api/endpoints';
import { Spinner } from '../components/atoms/Spinner/Spinner';
import { Alert } from '../components/molecules/Alert/Alert';
import { RatingList } from '../components/organisms/RatingList/RatingList';
import { useAsyncResource } from '../hooks/useAsyncResource';

export function MyRatingsPage() {
  const mine = useAsyncResource(() => ratingApi.mine(), []);
  return (
    <>
      <h1>Meine Bewertungen</h1>
      {mine.error && <Alert>{mine.error}</Alert>}
      {mine.loading ? <Spinner /> : (
        <RatingList ratings={mine.data?.items ?? []} showProduct empty="Du hast noch keine Sorte bewertet." />
      )}
    </>
  );
}

export function FeedPage() {
  const feed = useAsyncResource(() => ratingApi.feed(50), []);
  return (
    <>
      <h1>Neues aus der Runde</h1>
      {feed.error && <Alert>{feed.error}</Alert>}
      {feed.loading ? <Spinner /> : (
        <RatingList ratings={feed.data?.items ?? []} showProduct empty="Noch keine geteilten Bewertungen." />
      )}
    </>
  );
}
