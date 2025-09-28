const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Endpoint z danymi dla aplikacji
app.get('/api/data', (req, res) => {
  res.json({
    musicStats: {
      totalStreams: 2547890,
      totalRevenue: 125000,
      totalReleases: 45,
      totalArtists: 25
    },
    artists: [
      {
        id: 1,
        name: 'The Midnight',
        email: 'contact@themidnight.com',
        bio: 'Synthwave duo from Los Angeles',
        avatar: '',
        socialMedia: {
          spotify: 'https://open.spotify.com/artist/2NFrAuh8RQdQoS7iYFbckw',
          instagram: 'https://instagram.com/themidnightla',
          youtube: 'https://youtube.com/themidnight'
        },
        totalStreams: 850000,
        totalRevenue: 42000,
        status: 'active'
      },
      {
        id: 2,
        name: 'FM-84',
        email: 'info@fm84.net',
        bio: 'British synthwave producer',
        avatar: '',
        socialMedia: {
          spotify: 'https://open.spotify.com/artist/2NFrAuh8RQdQoS7iYFbckw'
        },
        totalStreams: 620000,
        totalRevenue: 28000,
        status: 'active'
      },
      {
        id: 3,
        name: 'Gunship',
        email: 'contact@gunshipmusic.com',
        bio: 'Dark synthwave collective',
        avatar: '',
        socialMedia: {
          spotify: 'https://open.spotify.com/artist/gunship'
        },
        totalStreams: 480000,
        totalRevenue: 22000,
        status: 'active'
      }
    ],
    releases: [
      {
        id: 1,
        title: 'Endless Summer',
        artist: 'The Midnight',
        status: 'Live',
        genre: 'Synthwave',
        releaseDate: '2023-06-15',
        splits: [{ name: 'The Midnight', share: '100%' }],
        coverImageUrl: '',
        audioUrl: '',
        totalStreams: 340000,
        totalRevenue: 15000
      },
      {
        id: 2,
        title: 'Atlas',
        artist: 'FM-84',
        status: 'Processing',
        genre: 'Synthwave',
        releaseDate: '2023-08-20',
        splits: [{ name: 'FM-84', share: '100%' }],
        coverImageUrl: '',
        audioUrl: '',
        totalStreams: 280000,
        totalRevenue: 12000
      },
      {
        id: 3,
        title: 'GUNSHIP',
        artist: 'Gunship',
        status: 'Live',
        genre: 'Darksynth',
        releaseDate: '2023-05-10',
        splits: [{ name: 'Gunship', share: '100%' }],
        coverImageUrl: '',
        audioUrl: '',
        totalStreams: 195000,
        totalRevenue: 8500
      },
      {
        id: 4,
        title: 'Leather Teeth',
        artist: 'Carpenter Brut',
        status: 'In Review',
        genre: 'Darksynth',
        releaseDate: '2023-09-01',
        splits: [{ name: 'Carpenter Brut', share: '100%' }],
        coverImageUrl: '',
        audioUrl: '',
        totalStreams: 0,
        totalRevenue: 0
      }
    ],
    books: [
      { id: 1, title: 'Digital Dreams', author: 'Alex Chen', status: 'Published', date: '2023-07-05' },
      { id: 2, title: 'Neon Nights', author: 'Sarah Kim', status: 'In Review', date: '2023-09-15' },
      { id: 3, title: 'Chrome Horizon', author: 'Michael Rodriguez', status: 'Editing', date: '2023-10-01' }
    ]
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    data: 'Test endpoint działa'
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Prosty serwer działa na porcie ${PORT}`);
});
