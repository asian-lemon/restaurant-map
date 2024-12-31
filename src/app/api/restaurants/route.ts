import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import mongoose from "mongoose";

// Ensure environment variables are set
const MONGODB_URI = process.env.MONGODB_URI;
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

if (!MONGODB_URI || !TOMTOM_API_KEY) {
  throw new Error(
    "Environment variables MONGODB_URI and TOMTOM_API_KEY are required"
  );
}

// MongoDB connection
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
});

const RestaurantSchema = new mongoose.Schema({
  name: String,
  address: String,
  distance: Number,
  latitude: Number,
  longitude: Number,
});

const Restaurant =
  mongoose.models.Restaurant || mongoose.model("Restaurant", RestaurantSchema);

export async function POST(req: NextRequest) {
  try {
    const { address, miles } = await req.json();

    if (!address || !miles) {
      return NextResponse.json(
        { error: "Address and radius are required" },
        { status: 400 }
      );
    }

    const radius = miles * 1609.34; // Convert miles to meters
    const geocodeUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(
      address
    )}.json`;

    const geocodeResponse = await axios.get(geocodeUrl, {
      params: { key: TOMTOM_API_KEY },
    });

    if (!geocodeResponse.data.results || !geocodeResponse.data.results.length) {
      throw new Error("Address not found");
    }

    const { lat, lon } = geocodeResponse.data.results[0].position;

    const searchUrl = `https://api.tomtom.com/search/2/search/restaurant.json`;
    const searchResponse = await axios.get(searchUrl, {
      params: {
        key: TOMTOM_API_KEY,
        lat,
        lon,
        radius,
        limit: 500,
      },
    });

    if (!searchResponse.data.results) {
      throw new Error("Failed to fetch restaurants from TomTom API");
    }

    // Correctly map restaurant data
    const restaurants = searchResponse.data.results.map((r: any) => ({
      name: r.poi?.name || "Unknown",
      address: r.address?.freeformAddress || "Unknown address",
      distance: r.dist || 0,
      latitude: r.position?.lat || 0,
      longitude: r.position?.lon || 0,
    }));

    // Save to MongoDB
    if (restaurants.length > 0) {
      await Restaurant.insertMany(restaurants);
    }

    return NextResponse.json({ success: true, restaurants, lat, lon });
  } catch (error: any) {
    console.error("Error in route.ts:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
