# CORS Configuration for Supabase Storage

## 🔧 Manual Configuration (Recommended)

### 1. Via Supabase Dashboard
1. Przejdź do **Storage** > **Settings**
2. W sekcji **CORS Configuration** dodaj:

```json
{
  "allowedOrigins": [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://hardbanrecords-terminal.onrender.com",
    "https://your-production-domain.com"
  ],
  "allowedMethods": [
    "GET", "POST", "PUT", "DELETE", "OPTIONS"
  ],
  "allowedHeaders": [
    "authorization",
    "x-client-info",
    "apikey",
    "content-type",
    "x-requested-with",
    "accept",
    "origin"
  ],
  "maxAge": 3600
}
```

### 2. Via JavaScript/TypeScript API

```typescript
// Dodaj do frontend/src/lib/supabase.ts
export const configureBucketCORS = async () => {
  const { data, error } = await supabase.storage
    .updateBucket('hardbanrecords-files', {
      public: true,
      allowedMimeTypes: [
        'image/*',
        'audio/*',
        'application/pdf',
        'text/plain'
      ],
      fileSizeLimit: 52428800 // 50MB
    });

  if (error) {
    console.error('CORS configuration error:', error);
    return false;
  }

  console.log('✅ CORS configured successfully');
  return true;
};
```

## 🧪 Testing CORS

### Curl Test
```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: authorization,content-type" \
  https://lniyanikhipfmrdubqvm.supabase.co/storage/v1/object/hardbanrecords-files/test
```

### JavaScript Test
```javascript
// Test w browser console
fetch('https://lniyanikhipfmrdubqvm.supabase.co/storage/v1/object/hardbanrecords-files/', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_ANON_KEY'
  }
})
.then(response => console.log('✅ CORS working:', response.status))
.catch(error => console.error('❌ CORS error:', error));
```

## 📝 Troubleshooting

1. **Błąd "cors" column does not exist**
   - ✅ Użyj dashboard lub API, nie SQL

2. **CORS policy error w browser**
   - Sprawdź allowed origins
   - Dodaj localhost dla development

3. **Authentication errors**
   - Sprawdź RLS policies
   - Użyj service_role key dla server-side

## 🎯 Production Checklist

- [ ] Bucket 'hardbanrecords-files' utworzony
- [ ] CORS skonfigurowany via dashboard
- [ ] RLS policies aktywne
- [ ] File upload test passed
- [ ] Frontend może odczytać pliki
- [ ] Size limits ustawione (50MB)
