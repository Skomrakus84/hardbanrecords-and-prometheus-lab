// Uruchomienie wszystkich migracji
// Plik: run_migrations.cjs

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Konfiguracja bazy danych
const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Lista plików migracji w kolejności wykonania
const migrationFiles = [
    '0001_core_music_tables.sql',
    '0002_music_indexes.sql',
    '0003_publishing_tables.sql'
];

async function runMigration(filename) {
    try {
        console.log(`Wykonuję migrację: ${filename}`);
        
        const migrationPath = path.join(__dirname, 'migrations', filename);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        // Podział SQL na pojedyncze komendy
        const commands = sql
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        for (const command of commands) {
            if (command.trim()) {
                const { error } = await supabase.rpc('exec_sql', { sql: command });
                if (error) {
                    throw error;
                }
            }
        }
        
        console.log(`✅ Migracja ${filename} wykonana pomyślnie`);
        return true;
    } catch (error) {
        console.error(`❌ Błąd podczas migracji ${filename}:`, error);
        return false;
    }
}

async function runAllMigrations() {
    console.log('🚀 Rozpoczynam migracje bazy danych...');
    
    try {
        // Sprawdź połączenie z bazą danych
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error && !error.message.includes('does not exist')) {
            throw new Error(`Błąd połączenia z bazą danych: ${error.message}`);
        }
        
        console.log('✅ Połączenie z bazą danych OK');
        
        // Wykonaj migracje
        for (const filename of migrationFiles) {
            const success = await runMigration(filename);
            if (!success) {
                console.error('💥 Zatrzymuję migracje z powodu błędu');
                process.exit(1);
            }
        }
        
        console.log('🎉 Wszystkie migracje wykonane pomyślnie!');
        
        // Sprawdź utworzone tabele
        console.log('\n📊 Sprawdzam utworzone tabele...');
        await listTables();
        
    } catch (error) {
        console.error('💥 Błąd podczas migracji:', error);
        process.exit(1);
    }
}

async function listTables() {
    try {
        const { data, error } = await supabase
            .rpc('exec_sql', { 
                sql: `
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    ORDER BY table_name
                `
            });
            
        if (error) throw error;
        
        console.log('Utworzone tabele:');
        data?.forEach(row => console.log(`  - ${row.table_name}`));
        
    } catch (error) {
        console.error('Błąd podczas pobierania listy tabel:', error);
    }
}

// Uruchom migracje jeśli plik jest wykonywany bezpośrednio
if (require.main === module) {
    runAllMigrations();
}

module.exports = {
    runAllMigrations,
    runMigration
};
