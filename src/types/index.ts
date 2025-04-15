export interface Listing {
  listing_idx: number;
  price: string;
  title: string;
  location: string;
  description: string;
  distance: number;
  url: string;
  img: string;
  query: string;
  search_title: string;
  watchlist: boolean;
  created_at: string;
}

export interface Scanner {
  id: number;
  category: string;
  query: string;
  town: string;
  status: string;
} 