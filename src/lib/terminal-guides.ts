// ============================================
// TERMINAL ULAŞIM REHBERİ
// Her otobüs terminali için toplu taşıma bilgileri
// ============================================

export interface TerminalGuide {
    terminalName: string;
    city: string;
    metro?: string;
    bus?: string;
    tram?: string;
    taxi?: string;
    general?: string;
}

export const terminalGuides: Record<string, TerminalGuide> = {
    'İstanbul Otogar': {
        terminalName: 'İstanbul Otogar (Esenler)',
        city: 'İstanbul',
        metro: 'M1A Yenikapı-Atatürk Havalimanı hattı, Otogar durağı. Taksim\'e aktarmasız ulaşabilirsiniz.',
        bus: '83, 83O, 139T, 145T hatları otogardan kalkar. Beylikdüzü, Bakırköy ve Mecidiyeköy yönleri mevcuttur.',
        tram: 'Zeytinburnu aktarma ile T1 tramvay hattına geçiş yapabilirsiniz (Sultanahmet, Eminönü).',
        taxi: 'Otogar çıkışında 7/24 taksi durağı mevcuttur. Taksim\'e ortalama 45-60 dk.',
        general: 'Otogar içinde ATM, market ve dinlenme alanları bulunur. İstanbulkart yükleme noktası giriş katındadır.',
    },
    'Ankara AŞTİ': {
        terminalName: 'Ankara Şehirlerarası Terminal (AŞTİ)',
        city: 'Ankara',
        metro: 'Ankaray M1 hattı, AŞTİ durağı. Kızılay\'a 15 dakikada ulaşabilirsiniz.',
        bus: 'EGO 124, 125, 196 hatları AŞTİ\'den kalkar. Çankaya, Kızılay ve Ulus yönleri.',
        tram: 'Bu terminalde tramvay bağlantısı bulunmamaktadır.',
        taxi: 'Terminal çıkışında taksi durağı mevcuttur. Kızılay\'a ortalama 15-20 dk.',
        general: 'AŞTİ içinde yeme-içme alanları, bekleme salonları ve bagaj emanet hizmeti bulunur.',
    },
    'İzmir Otogar': {
        terminalName: 'İzmir Şehirlerarası Otobüs Terminali',
        city: 'İzmir',
        metro: 'İZBAN Otogar durağı ile Alsancak, Konak ve Adnan Menderes Havalimanı\'na ulaşım sağlanır.',
        bus: 'ESHOT 64, 65, 603, 604 hatları terminalden kalkar. Konak, Bornova, Karşıyaka yönleri.',
        tram: 'Bu terminalde tramvay bağlantısı bulunmamaktadır.',
        taxi: 'Terminal çıkışında taksi durağı mevcuttur. Konak\'a ortalama 20-25 dk.',
        general: 'Terminal içinde İzmirim Kart satış noktası, market ve kafeteryalar bulunur.',
    },
    'Bursa Terminali': {
        terminalName: 'Bursa Şehirlerarası Otobüs Terminali',
        city: 'Bursa',
        metro: 'BursaRay hattı terminal yakınından geçer. Osmangazi Metro durağından şehir merkezine ulaşım.',
        bus: 'BURULAŞ 96, 97 hatları terminalden kalkar. Heykel, Çekirge yönleri.',
        tram: 'T1 tramvay hattı ile İstanbul Caddesi ve kent merkezine ulaşım.',
        taxi: 'Terminal çıkışında taksi durağı mevcuttur. Heykel\'e ortalama 20-25 dk.',
        general: 'Terminal içinde Bursakart satış noktası ve yeme-içme alanları bulunur.',
    },
    'Bursa Terminal': {
        terminalName: 'Bursa Şehirlerarası Otobüs Terminali',
        city: 'Bursa',
        metro: 'BursaRay hattı terminal yakınından geçer. Osmangazi Metro durağından şehir merkezine ulaşım.',
        bus: 'BURULAŞ 96, 97 hatları terminalden kalkar. Heykel, Çekirge yönleri.',
        tram: 'T1 tramvay hattı ile İstanbul Caddesi ve kent merkezine ulaşım.',
        taxi: 'Terminal çıkışında taksi durağı mevcuttur. Heykel\'e ortalama 20-25 dk.',
        general: 'Terminal içinde Bursakart satış noktası ve yeme-içme alanları bulunur.',
    },
    'Antalya Otogar': {
        terminalName: 'Antalya Şehirlerarası Otobüs Terminali',
        city: 'Antalya',
        metro: 'AntRay tramvayı ile Otogar durağından Expo, Meydan ve Fatih yönlerine ulaşım.',
        bus: 'ANTOŞ KC06, KC08, KL08 hatları terminali çevre ilçelere bağlar.',
        tram: 'AntRay T2 hattı Otogar durağı. Konyaaltı ve Expo yönleri.',
        taxi: 'Terminal çıkışında taksi durağı. Kaleiçi/Konyaaltı\'na ortalama 20-30 dk.',
        general: 'Terminal içinde AntalyaKart satış noktası, market ve dinlenme odaları bulunur.',
    },
    'Bolu Dağı Dinlenme': {
        terminalName: 'Bolu Dağı Dinlenme Tesisi',
        city: 'Bolu',
        general: 'Bu bir mola noktasıdır. Restoran, market, tuvalet ve yakıt istasyonu bulunur. Toplu taşıma bağlantısı yoktur.',
    },
    'Bolu Dinlenme': {
        terminalName: 'Bolu Dağı Dinlenme Tesisi',
        city: 'Bolu',
        general: 'Bu bir mola noktasıdır. Restoran, market, tuvalet ve yakıt istasyonu bulunur. Toplu taşıma bağlantısı yoktur.',
    },
    'Ankara Giriş': {
        terminalName: 'Ankara Giriş (Yeni Şehir)',
        city: 'Ankara',
        general: 'Ara durak noktasıdır. AŞTİ\'ye devam edilecektir.',
    },
    'Balıkesir': {
        terminalName: 'Balıkesir Otogarı',
        city: 'Balıkesir',
        bus: 'Belediye otobüsleri ile şehir merkezine ulaşım sağlanır.',
        taxi: 'Otogar çıkışında taksi durağı mevcuttur.',
        general: 'Otogar içinde kafeterya ve bekleme salonu bulunur.',
    },
    'Konya': {
        terminalName: 'Konya Şehirlerarası Otogar',
        city: 'Konya',
        tram: 'T1 ve T2 tramvay hatları ile Mevlana Müzesi, Alaaddin ve üniversiteye ulaşım.',
        bus: 'KONBİR otobüsleri ile şehir merkezine düzenli seferler.',
        taxi: 'Otogar çıkışında taksi durağı mevcuttur. Mevlana\'ya ortalama 15 dk.',
        general: 'KonyaKart satış noktası otogar gişelerinde bulunur.',
    },
    'Isparta': {
        terminalName: 'Isparta Otogarı',
        city: 'Isparta',
        bus: 'Belediye minibüsleri ile şehir merkezine ulaşım.',
        taxi: 'Otogar çıkışında taksi durağı mevcuttur.',
        general: 'Otogar içinde kafeterya bulunur.',
    },
    'Yalova': {
        terminalName: 'Yalova Otogarı',
        city: 'Yalova',
        bus: 'Belediye otobüsleri ile sahil ve feribot iskelesine ulaşım.',
        taxi: 'Otogar çıkışında taksi durağı mevcuttur. İskele\'ye 10 dk.',
        general: 'İstanbul feribotlarına aktarma yapılabilir (IDO/BUDO).',
    },
};

// Helper: find guide by stop name
export function findGuideForStop(stopName: string): TerminalGuide | null {
    return terminalGuides[stopName] || null;
}
