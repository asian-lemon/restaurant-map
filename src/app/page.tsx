import RestaurantMap from './components/RestaurantMap';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Restaurant Finder</h1>
        <RestaurantMap />
      </div>
    </main>
  );
}