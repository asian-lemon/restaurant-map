import axios from 'axios';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// MongoDB URI from .env.local
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env.local');
}

// Connect to MongoDB Atlas
mongoose
    .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB Atlas:', err.message);
    });

// Define a schema and model for restaurants
const restaurantSchema = new mongoose.Schema({
    name: String,
    address: String,
    distance: Number,
    latitude: Number,
    longitude: Number,
}, { timestamps: true });

const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

// Function to convert miles to meters
const milesToMeters = (miles: number) => miles * 1609.34;

// Function to fetch latitude and longitude from an address
const getCoordinatesFromAddress = async (address: string) => {
    const geocodeUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json`;
    const response = await axios.get(geocodeUrl, {
        params: { key: process.env.TOMTOM_API_KEY },
    });

    if (!response.data.results.length) {
        throw new Error('Address not found');
    }

    const { lat, lon } = response.data.results[0].position;
    return { lat, lon };
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { address, miles } = body;

        if (!address || !miles) {
            return NextResponse.json({ error: 'Address and radius are required' }, { status: 400 });
        }

        const radius = milesToMeters(miles);
        const { lat, lon } = await getCoordinatesFromAddress(address);

        const url = 'https://api.tomtom.com/search/2/search/restaurant.json';
        const response = await axios.get(url, {
            params: {
                key: process.env.TOMTOM_API_KEY,
                lat,
                lon,
                radius,
                limit: 500,
            },
        });

        if (!response.data.results) {
            throw new Error('Failed to fetch restaurants from TomTom API');
        }

        const restaurants = response.data.results.map((r: any) => ({
            name: r.poi?.name || 'Unknown',
            address: r.address?.freeformAddress || 'Unknown address',
            distance: r.dist || 0,
            latitude: r.position?.lat || 0,
            longitude: r.position?.lon || 0,
        }));

        // Save to MongoDB
        await Restaurant.insertMany(restaurants);

        return NextResponse.json({
            success: true,
            restaurants,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error in POST handler:', error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            console.error('Unknown error in POST handler:', error);
            return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
        }
    }
}
