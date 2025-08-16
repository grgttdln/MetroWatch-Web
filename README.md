# MetroWatch-Web

MetroWatch-Web is a civic reporting web application that provides an interactive map interface for viewing and managing community reports. Users can view various types of reports (garbage, traffic, flooding, vandalism, etc.) displayed on an interactive map with real-time updates.

## Features

- 🗺️ Interactive map powered by Leaflet and OpenStreetMap
- 📍 Real-time report markers with different severity levels
- 📱 Responsive design for mobile and desktop
- 🔄 Real-time updates using Supabase subscriptions
- 📊 Detailed report sidebar with filtering capabilities
- 🎨 Modern UI with Tailwind CSS

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 18.0 or higher)
- **npm** (comes with Node.js)
- **Supabase account** and project

## Installation

1. **Clone the repository**

   ```bash
   git clone <your-repository-url>
   cd MetroWatch-Web
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory and add your Supabase credentials:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   To get these values:

   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Navigate to Settings → API
   - Copy the Project URL and anon/public key

## Running the Application

### Development Mode

To start the development server with hot reloading:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build

To build the application for production:

```bash
npm run build
```

To start the production server:

```bash
npm run start
```

### Linting

To run the linter:

```bash
npm run lint
```

## Database Setup

This application requires a Supabase database with the following structure:

### Required Tables

1. **reports** table with columns:

   - `report_id` (primary key)
   - `latitude` (decimal)
   - `longitude` (decimal)
   - `severity` (text: 'high', 'medium', 'low')
   - `category` (text)
   - `description` (text)
   - `date` (date)
   - `time` (time)
   - `location` (text)
   - `url` (text, optional)
   - `user_id` (foreign key)
   - `upvote` (integer)
   - `status` (text)

2. **users** table with columns:
   - `user_id` (primary key)
   - `name` (text)

### Real-time Setup

Enable real-time subscriptions for the `reports` table in your Supabase dashboard:

1. Go to Database → Replication
2. Enable real-time for the `reports` table

## Project Structure

```
MetroWatch-Web/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout component
│   └── page.js            # Main page component
├── components/            # React components
│   ├── ReportDetail.js    # Report detail component
│   └── ReportsSidebar.js  # Reports sidebar component
├── utils/                 # Utility functions
│   └── supabase/         # Supabase configuration
│       ├── api.js        # Database API functions
│       └── client.js     # Supabase client setup
├── public/               # Static assets
└── package.json         # Dependencies and scripts
```

## Technology Stack

- **Framework**: Next.js 15.4.6
- **Frontend**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **Maps**: Leaflet + React-Leaflet
- **Real-time**: Supabase Realtime

## Supported Report Categories

The application supports the following report categories:

- 🗑️ Garbage
- 🚦 Traffic
- 🌊 Flooding
- ⚠️ Vandalism
- 🔊 Noise Pollution
- 🕳️ Road Damage
- 🚗 Illegal Parking
- 💡 Street Lighting
- 🐶 Stray Animals
- 📋 Others

## Troubleshooting

### Common Issues

1. **Map not loading**: Ensure you have a stable internet connection as the map uses OpenStreetMap tiles.

2. **Database connection errors**:

   - Verify your Supabase environment variables are correct
   - Check that your Supabase project is active
   - Ensure the database tables exist with the correct structure

3. **Real-time updates not working**:

   - Verify real-time is enabled for the `reports` table in Supabase
   - Check browser console for WebSocket connection errors

4. **Styling issues**:
   - Try clearing your browser cache
   - Ensure Tailwind CSS is properly configured

### Environment Variables

If the application throws errors about missing environment variables, double-check that:

- Your `.env.local` file is in the root directory
- Variable names match exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No extra spaces or quotes around the values

## Support

For issues related to:

- **Supabase**: Check the [Supabase Documentation](https://supabase.com/docs)
- **Next.js**: Check the [Next.js Documentation](https://nextjs.org/docs)
- **Leaflet**: Check the [Leaflet Documentation](https://leafletjs.com/reference.html)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license information here]
