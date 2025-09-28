// Serwis walidacji metadanych
// Plik: metadataValidator.service.cjs

const logger = require('../config/logger.cjs');

class MetadataValidatorService {
    constructor() {
        this.validationRules = {
            // Reguły dla wydań
            release: {
                title: {
                    required: true,
                    minLength: 1,
                    maxLength: 500,
                    forbiddenChars: ['<', '>', '"', '&']
                },
                upc: {
                    required: false,
                    pattern: /^[0-9]{12}$/,
                    unique: true
                },
                genre: {
                    required: true,
                    allowedValues: [
                        'Rock', 'Pop', 'Hip-Hop', 'Electronic', 'Jazz', 'Classical',
                        'Country', 'R&B', 'Folk', 'Alternative', 'Metal', 'Punk',
                        'Reggae', 'Blues', 'World', 'Instrumental', 'Soundtrack'
                    ]
                },
                language: {
                    required: true,
                    pattern: /^[a-z]{2}$/
                },
                releaseDate: {
                    required: true,
                    futureAllowed: true,
                    maxFuture: 365 // dni w przyszłość
                }
            },
            // Reguły dla utworów
            track: {
                title: {
                    required: true,
                    minLength: 1,
                    maxLength: 500,
                    forbiddenChars: ['<', '>', '"', '&']
                },
                isrc: {
                    required: false,
                    pattern: /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/,
                    unique: true
                },
                duration: {
                    required: true,
                    minDuration: 30000, // 30 sekund w ms
                    maxDuration: 3600000 // 60 minut w ms
                },
                trackNumber: {
                    required: true,
                    min: 1,
                    max: 999
                }
            },
            // Reguły dla artystów
            artist: {
                name: {
                    required: true,
                    minLength: 1,
                    maxLength: 255,
                    forbiddenChars: ['<', '>', '"', '&']
                },
                email: {
                    required: false,
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                }
            }
        };

        this.platformRequirements = {
            spotify: {
                release: {
                    coverArt: { required: true, minSize: 640, format: ['jpg', 'png'] },
                    title: { maxLength: 100 },
                    artist: { maxLength: 100 }
                },
                track: {
                    title: { maxLength: 100 },
                    minDuration: 30000,
                    maxDuration: 3600000,
                    audioFormat: ['mp3', 'flac', 'wav']
                }
            },
            appleMusic: {
                release: {
                    coverArt: { required: true, minSize: 1400, format: ['jpg', 'png'] },
                    title: { maxLength: 255 },
                    upc: { required: true }
                },
                track: {
                    title: { maxLength: 255 },
                    isrc: { required: true },
                    minDuration: 30000,
                    audioFormat: ['aac', 'alac', 'mp3']
                }
            },
            youtube: {
                release: {
                    coverArt: { required: true, minSize: 1280, format: ['jpg', 'png'] }
                },
                track: {
                    minDuration: 30000,
                    audioFormat: ['mp3', 'wav', 'flac']
                }
            }
        };
    }

    // Waliduj metadane wydania
    async validateRelease(releaseData, platforms = []) {
        try {
            const errors = [];
            const warnings = [];

            // Podstawowa walidacja
            const basicValidation = this.validateBasicData(releaseData, 'release');
            errors.push(...basicValidation.errors);
            warnings.push(...basicValidation.warnings);

            // Walidacja specyficzna dla platform
            for (const platform of platforms) {
                const platformValidation = this.validateForPlatform(releaseData, 'release', platform);
                errors.push(...platformValidation.errors);
                warnings.push(...platformValidation.warnings);
            }

            // Sprawdź unikalność UPC
            if (releaseData.upc) {
                const upcUnique = await this.checkUpcUniqueness(releaseData.upc, releaseData.id);
                if (!upcUnique) {
                    errors.push('UPC musi być unikalny');
                }
            }

            const result = {
                valid: errors.length === 0,
                errors,
                warnings,
                score: this.calculateQualityScore(releaseData, errors, warnings)
            };

            logger.info('Walidacja wydania zakończona:', {
                releaseId: releaseData.id,
                valid: result.valid,
                errorsCount: errors.length,
                warningsCount: warnings.length,
                score: result.score
            });

            return result;
        } catch (error) {
            logger.error('Błąd walidacji wydania:', error);
            throw new Error(`Błąd walidacji: ${error.message}`);
        }
    }

    // Waliduj metadane utworu
    async validateTrack(trackData, platforms = []) {
        try {
            const errors = [];
            const warnings = [];

            // Podstawowa walidacja
            const basicValidation = this.validateBasicData(trackData, 'track');
            errors.push(...basicValidation.errors);
            warnings.push(...basicValidation.warnings);

            // Walidacja specyficzna dla platform
            for (const platform of platforms) {
                const platformValidation = this.validateForPlatform(trackData, 'track', platform);
                errors.push(...platformValidation.errors);
                warnings.push(...platformValidation.warnings);
            }

            // Sprawdź unikalność ISRC
            if (trackData.isrc) {
                const isrcUnique = await this.checkIsrcUniqueness(trackData.isrc, trackData.id);
                if (!isrcUnique) {
                    errors.push('ISRC musi być unikalny');
                }
            }

            const result = {
                valid: errors.length === 0,
                errors,
                warnings,
                score: this.calculateQualityScore(trackData, errors, warnings)
            };

            return result;
        } catch (error) {
            logger.error('Błąd walidacji utworu:', error);
            throw new Error(`Błąd walidacji: ${error.message}`);
        }
    }

    // Podstawowa walidacja danych
    validateBasicData(data, type) {
        const errors = [];
        const warnings = [];
        const rules = this.validationRules[type];

        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];

            // Sprawdź wymagalność
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors.push(`Pole ${field} jest wymagane`);
                continue;
            }

            // Sprawdź tylko jeśli wartość istnieje
            if (value !== null && value !== undefined && value !== '') {
                // Sprawdź długość
                if (rule.minLength && value.toString().length < rule.minLength) {
                    errors.push(`Pole ${field} musi mieć co najmniej ${rule.minLength} znaków`);
                }
                if (rule.maxLength && value.toString().length > rule.maxLength) {
                    errors.push(`Pole ${field} może mieć maksymalnie ${rule.maxLength} znaków`);
                }

                // Sprawdź wzorzec
                if (rule.pattern && !rule.pattern.test(value.toString())) {
                    errors.push(`Pole ${field} ma nieprawidłowy format`);
                }

                // Sprawdź dozwolone wartości
                if (rule.allowedValues && !rule.allowedValues.includes(value)) {
                    errors.push(`Pole ${field} ma niedozwoloną wartość`);
                }

                // Sprawdź zabronione znaki
                if (rule.forbiddenChars) {
                    const forbiddenFound = rule.forbiddenChars.some(char => value.toString().includes(char));
                    if (forbiddenFound) {
                        errors.push(`Pole ${field} zawiera zabronione znaki`);
                    }
                }

                // Sprawdź zakres liczbowy
                if (rule.min && Number(value) < rule.min) {
                    errors.push(`Pole ${field} musi być co najmniej ${rule.min}`);
                }
                if (rule.max && Number(value) > rule.max) {
                    errors.push(`Pole ${field} może być maksymalnie ${rule.max}`);
                }

                // Sprawdź czas trwania
                if (rule.minDuration && Number(value) < rule.minDuration) {
                    errors.push(`Utwór musi trwać co najmniej ${rule.minDuration / 1000} sekund`);
                }
                if (rule.maxDuration && Number(value) > rule.maxDuration) {
                    errors.push(`Utwór może trwać maksymalnie ${rule.maxDuration / 60000} minut`);
                }

                // Sprawdź datę wydania
                if (field === 'releaseDate' && rule.futureAllowed) {
                    const releaseDate = new Date(value);
                    const now = new Date();
                    const maxFutureDate = new Date(now.getTime() + (rule.maxFuture * 24 * 60 * 60 * 1000));

                    if (releaseDate > maxFutureDate) {
                        errors.push(`Data wydania może być maksymalnie ${rule.maxFuture} dni w przyszłość`);
                    }
                }
            }
        }

        return { errors, warnings };
    }

    // Walidacja dla konkretnej platformy
    validateForPlatform(data, type, platform) {
        const errors = [];
        const warnings = [];
        const platformRules = this.platformRequirements[platform];

        if (!platformRules || !platformRules[type]) {
            return { errors, warnings };
        }

        const rules = platformRules[type];

        // Sprawdź wymagania platform
        for (const [field, requirement] of Object.entries(rules)) {
            const value = data[field];

            if (requirement.required && (!value || value.toString().trim() === '')) {
                errors.push(`${platform}: Pole ${field} jest wymagane`);
            }

            if (value && requirement.maxLength && value.toString().length > requirement.maxLength) {
                warnings.push(`${platform}: Pole ${field} może być zbyt długie (max ${requirement.maxLength})`);
            }

            if (requirement.format && data.coverArt) {
                const fileExtension = data.coverArt.split('.').pop().toLowerCase();
                if (!requirement.format.includes(fileExtension)) {
                    errors.push(`${platform}: Format okładki musi być: ${requirement.format.join(', ')}`);
                }
            }

            if (requirement.minSize && data.coverArtWidth && data.coverArtWidth < requirement.minSize) {
                warnings.push(`${platform}: Okładka powinna mieć co najmniej ${requirement.minSize}px szerokości`);
            }
        }

        return { errors, warnings };
    }

    // Sprawdź unikalność UPC
    async checkUpcUniqueness(upc, excludeId = null) {
        try {
            // TODO: Implementacja sprawdzenia w bazie danych
            // const { data } = await this.supabase
            //     .from('releases')
            //     .select('id')
            //     .eq('upc', upc)
            //     .neq('id', excludeId || '')
            //     .single();
            // return !data;

            // Placeholder - zawsze zwraca true
            return true;
        } catch (error) {
            logger.error('Błąd sprawdzania unikalności UPC:', error);
            return false;
        }
    }

    // Sprawdź unikalność ISRC
    async checkIsrcUniqueness(isrc, excludeId = null) {
        try {
            // TODO: Implementacja sprawdzenia w bazie danych
            // const { data } = await this.supabase
            //     .from('tracks')
            //     .select('id')
            //     .eq('isrc', isrc)
            //     .neq('id', excludeId || '')
            //     .single();
            // return !data;

            // Placeholder - zawsze zwraca true
            return true;
        } catch (error) {
            logger.error('Błąd sprawdzania unikalności ISRC:', error);
            return false;
        }
    }

    // Oblicz ocenę jakości metadanych
    calculateQualityScore(data, errors, warnings) {
        let score = 100;

        // Odejmij punkty za błędy
        score -= errors.length * 10;

        // Odejmij punkty za ostrzeżenia
        score -= warnings.length * 5;

        // Premia za kompletność danych
        const completenessBonus = this.calculateCompletenessBonus(data);
        score += completenessBonus;

        // Ogranicz zakres 0-100
        return Math.max(0, Math.min(100, score));
    }

    // Oblicz bonus za kompletność danych
    calculateCompletenessBonus(data) {
        let bonus = 0;
        const optionalFields = ['description', 'genre', 'label', 'copyrightInfo'];

        optionalFields.forEach(field => {
            if (data[field] && data[field].toString().trim() !== '') {
                bonus += 2;
            }
        });

        return bonus;
    }

    // Generuj rekomendacje poprawy
    generateRecommendations(validationResult, type) {
        const recommendations = [];

        // Rekomendacje na podstawie błędów
        validationResult.errors.forEach(error => {
            if (error.includes('wymagane')) {
                recommendations.push('Wypełnij wszystkie wymagane pola');
            }
            if (error.includes('format')) {
                recommendations.push('Sprawdź formaty kodów (UPC, ISRC)');
            }
            if (error.includes('długie')) {
                recommendations.push('Skróć zbyt długie teksty');
            }
        });

        // Rekomendacje na podstawie ostrzeżeń
        validationResult.warnings.forEach(warning => {
            if (warning.includes('okładka')) {
                recommendations.push('Rozważ użycie okładki o wyższej rozdzielczości');
            }
        });

        // Ogólne rekomendacje
        if (validationResult.score < 80) {
            recommendations.push('Uzupełnij dodatkowe informacje aby poprawić jakość metadanych');
        }

        return [...new Set(recommendations)]; // Usuń duplikaty
    }
}

module.exports = MetadataValidatorService;
