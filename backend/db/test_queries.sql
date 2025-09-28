-- ===================================================================
-- ZAPYTANIA TESTOWE - WERYFIKACJA INSTALACJI
-- ===================================================================

-- Test 1: Podstawowe statystyki
SELECT 'BASIC STATS TEST' as test_name;
SELECT * FROM dashboard_stats;

-- Test 2: Ostatnie aktywności
SELECT 'RECENT ACTIVITIES TEST' as test_name;
SELECT * FROM recent_activities LIMIT 5;

-- Test 3: Top releases by streams
SELECT 'TOP RELEASES TEST' as test_name;
SELECT
    r.title,
    a.name as artist_name,
    r.streams,
    r.revenue,
    r.status
FROM releases r
JOIN artists a ON r.artist_id = a.id
ORDER BY r.streams DESC
LIMIT 5;

-- Test 4: Top books by sales
SELECT 'TOP BOOKS TEST' as test_name;
SELECT
    b.title,
    au.name as author_name,
    b.sales,
    b.revenue,
    b.status
FROM books b
JOIN authors au ON b.author_id = au.id
ORDER BY b.sales DESC
LIMIT 5;

-- Test 5: Platform distribution
SELECT 'PLATFORM DISTRIBUTION TEST' as test_name;
SELECT
    type,
    COUNT(*) as platform_count,
    COUNT(*) FILTER (WHERE status = 'active') as active_count
FROM platforms
GROUP BY type
ORDER BY type;

-- Test 6: Revenue breakdown
SELECT 'REVENUE BREAKDOWN TEST' as test_name;
SELECT
    'Music' as source,
    COALESCE(SUM(revenue), 0) as total_revenue
FROM releases
UNION ALL
SELECT
    'Publishing' as source,
    COALESCE(SUM(revenue), 0) as total_revenue
FROM books
ORDER BY total_revenue DESC;

-- Test 7: Monthly analytics
SELECT 'MONTHLY ANALYTICS TEST' as test_name;
SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as releases_count
FROM releases
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Test 8: Artist performance
SELECT 'ARTIST PERFORMANCE TEST' as test_name;
SELECT
    a.name,
    COUNT(r.id) as releases_count,
    COALESCE(SUM(r.streams), 0) as total_streams,
    COALESCE(SUM(r.revenue), 0) as total_revenue
FROM artists a
LEFT JOIN releases r ON a.id = r.artist_id
GROUP BY a.id, a.name
ORDER BY total_streams DESC;

SELECT 'ALL TESTS COMPLETED SUCCESSFULLY ✅' as status;
