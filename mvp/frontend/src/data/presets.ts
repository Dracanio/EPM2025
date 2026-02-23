export interface Preset {
    id: string;
    name: string;
    description: string;
    thumbnail?: string;
    data: any[];
    canvas?: {
        width: number;
        height: number;
        fill: string;
    };
    styleGuide?: {
        enabled: boolean;
        colors: string[];
        fonts: string[];
        fontSizes: number[];
    };
}

export const PRESETS: Preset[] = [
    {
        id: 'blank',
        name: 'Leeres Projekt',
        description: 'Starte mit einer leeren Vorlage',
        data: [],
        canvas: { width: 800, height: 600, fill: '#ffffff' }
    },
    {
        id: 'mi-bachelor',
        name: 'Medieninformatik Infoposter',
        description: 'Hochformatposter für den Medieninformatik Bachelor/Master mit Headerbild.',
        canvas: { width: 875, height: 2310, fill: '#ffffff' },
        styleGuide: {
            enabled: true,
            colors: ['#EFEFEF', '#ED1B65', '#00AB42', '#9829C8', '#241F20', '#AAAAAA'],
            fonts: ['Roboto Slab', 'PT Sans'],
            fontSizes: [18, 25, 32, 40, 50, 63]
        },
        data: [
            { id: '1771775455361', type: 'image', x: 0, y: 0, width: 963.9652237217446, height: 390.3746516923916, src: 'https://www.medieninformatik.th-koeln.de/study/bachelor/teaser_hue33df2da01c4fc2f834ad230e12509a5_410187_1600x0_resize_q100_linear.jpg', rotation: 0, opacity: 1, objectFit: 'cover', name: 'Header-Bild' },
            { id: '1771775282993', type: 'text', x: 60, y: 445, fill: '#241F20', opacity: 1, width: 675, height: 128, text: 'Medieninformatik\nBachelor', fontSize: 63, fontFamily: 'Roboto Slab', fontStyle: 'bold', textDecoration: '', rotation: 0, name: 'Titel' },
            { id: '1771775378334', type: 'text', x: 60, y: 620, fill: '#1e293b', opacity: 1, width: 744, height: 1208, text: 'Die Menschen mit ihren Bedürfnissen stehen im Zen-\ntrum der Medieninformatik. Absolvent*innen unserer Medieninformatik-Studiengänge konzipieren und explorieren neue digitale Medien und interaktive digi-\ntale Produkte, implementieren diese in Hard- und Software, treiben interdisziplinäre Entwicklungspro-\nzesse voran, und analysieren und evaluieren deren Nutzung. Sie sind in der Lage, ihr Wissen in anwen-\ndungsorientierten Projekten umzusetzen, wissen-schaftlich fundierte Urteile abzuleiten und Lösungs-\nansätze zu entwickeln und zu realisieren.\n\nMedieninformatiker*innen können die Anforderungen und Bedürfnisse der Nutzer*innen identifizieren und in den Gestaltungsprozess integrieren. Dies ermög-\nlicht die Entwicklung nutzer*innenzentrierter Lösun-\ngen, die nicht nur funktional, sondern auch ästhetisch ansprechend sind. Absolvent*innen zeichnen sich durch ein tiefes Technologieverständnis aus. Von der Konzeption bis zur Implementierung interaktiver und verteilter Systeme setzen die Absolvent*innen ihr Wis-\nsen ein, um effiziente und innovative Lösungen zu schaffen. Sie nehmen eine aktive Rolle in kreativen Prozessen ein, managen diese erfolgreich und kom-\nmunizieren effektiv innerhalb des Teams sowie mit relevanten Stakeholdern. Dabei reflektieren und be-\nrücksichtigen sie die unterschiedlichen Sichtweisen und Interessen anderer Beteiligter. Absolvent*innen sind in der Lage, selbstgesteuert zu lernen und sich kontinuierlich weiterzuentwickeln.', fontSize: 32, fontFamily: 'PT Sans', fontStyle: 'normal', textDecoration: '', rotation: 0, name: 'Beschreibung', lineHeight: 1.25 },
            { id: '1771776077339', type: 'image', x: 50, y: 2140, width: 112, height: 112, src: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg', rotation: 0, opacity: 1, objectFit: 'cover', name: 'QR-Code 1' },
            { id: '1771776118430', type: 'text', x: 175, y: 2160, fill: '#1e293b', opacity: 1, width: 200, height: 20, text: 'Mehr zu:', fontSize: 18, fontFamily: 'Outfit', fontStyle: 'bold', textDecoration: '', rotation: 0, name: 'QR Label 1a' },
            { id: '6c45039c-f048-4dc2-b144-a805b264d843', type: 'text', x: 175, y: 2183, fill: '#1e293b', opacity: 1, width: 295, height: 20, text: 'Medieninformatik B.Sc.', fontSize: 18, fontFamily: 'Outfit', fontStyle: 'normal', textDecoration: '', rotation: 0, name: 'QR Label 1b' },
            { id: '61f17b39-5886-4634-8cd5-af6288db7dd6', type: 'image', x: 432, y: 2140, width: 112, height: 112, src: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg', rotation: 0, opacity: 1, objectFit: 'cover', name: 'QR-Code 2' },
            { id: 'fcbf96f5-de4e-45a5-a294-d098e7340d7e', type: 'text', x: 558, y: 2160, fill: '#1e293b', opacity: 1, width: 200, height: 20, text: 'Infos für', fontSize: 18, fontFamily: 'Outfit', fontStyle: 'normal', textDecoration: '', rotation: 0, name: 'QR Label 2a' },
            { id: 'cf2ecca9-f166-4752-97f0-73c8de1a0b2a', type: 'text', x: 558, y: 2183, fill: '#1e293b', opacity: 1, width: 237, height: 20, text: 'Studieninteressierte', fontSize: 18, fontFamily: 'Outfit', fontStyle: 'normal', textDecoration: '', rotation: 0, name: 'QR Label 2b' }
        ]
    },
    {
        id: 'beamcontrol',
        name: 'BeamControl – Projektposter',
        description: 'A4-Projektposter mit Headerbild, Bullet-Points und dekorativen Farbstreifen.',
        canvas: { width: 595, height: 842, fill: '#ffffff' },
        styleGuide: { enabled: false, colors: ['#EFEFEF', '#ED1B65', '#00AB42', '#9829C8', '#241F20', '#AAAAAA'], fonts: ['Roboto Slab', 'PT Sans'], fontSizes: [25, 32, 40, 50, 63] },
        data: [
            { id: '1771777668872', type: 'image', x: 0, y: 0, width: 594.9741884417409, height: 248.20851508042756, src: 'https://i0.wp.com/rootedthought.de/wp-content/uploads/2023/08/placeholder-1.png?fit=1200%2C800&ssl=1&w=640', rotation: 0, opacity: 1, objectFit: 'cover', name: 'Image 1', lockedSections: ['content'] },
            { id: '1771777681515', type: 'text', x: 40, y: 307, fill: '#000000', opacity: 1, width: 257.6207607617132, height: 100, text: 'BeamControl', fontSize: 40, fontFamily: 'Inter', fontStyle: 'bold', textDecoration: '', rotation: 0, name: 'Titel', lockedSections: ['content'] },
            { id: '18c46508-0881-4e75-bab4-5f4ae7d0e1b5', type: 'text', x: 40, y: 357, fill: '#000000', opacity: 1, width: 463.03620381891346, height: 100, text: 'Interaktionen im SmartHome mittels Laserpointer', fontSize: 18, fontFamily: 'Inter', fontStyle: 'bold', textDecoration: '', rotation: 0, name: 'Untertitel', lockedSections: ['content'] },
            { id: '67317221-b9a3-4795-929f-f8412ec25774', type: 'text', x: 40, y: 430, fill: '#000000', opacity: 1, width: 24.748798087956292, height: 110.169, text: '-\n-\n-\n-', fontSize: 18, fontFamily: 'Arial', fontStyle: 'normal', textDecoration: '', rotation: 0, name: 'Bullet-Punkte', lineHeight: 1.4, lockedSections: ['content'] },
            { id: '666a7aec-ebb8-47e9-a56b-92313d93a6c9', type: 'text', x: 65, y: 431, fill: '#000000', opacity: 1, width: 463.0362038189132, height: 110.169, text: 'Apps einfach durch Pointing-Geste öffnen\nSuche der App-Icons auf Smartphone entfällt\nDie Geräte erkennen den Laserpointer\nIoT-Plattform zur Integration verschiedener Geräte', fontSize: 18, fontFamily: 'Arial', fontStyle: 'normal', textDecoration: '', rotation: 0, name: 'Bullet-Text', lineHeight: 1.4, lockedSections: ['content'] },
            { id: '1771778154914', type: 'rect', x: -13.7993006751, y: 787.9886239811, fill: '#e74d15', opacity: 0.9, width: 644.5544956968727, height: 188.7697972084036, radius: 50, fontSize: 32, fontFamily: 'Outfit', fontStyle: 'normal', textDecoration: '', rotation: -7.117525714386315, name: 'Streifen 1' },
            { id: 'b905e0dc-98a1-4908-9893-07c445592b29', type: 'rect', x: 356.1350599197341, y: 882.373522585311, fill: '#9f1982', opacity: 0.8, width: 644.5544956968707, height: 202.9989122843095, radius: 50, fontSize: 32, fontFamily: 'Outfit', fontStyle: 'normal', textDecoration: '', rotation: -57.339431807168744, name: 'Streifen 2' },
            { id: '86c1ab31-c9a1-4291-b2f1-dc2319714e42', type: 'rect', x: 594.9741884417409, y: 661.7825631805215, fill: '#e74d15', opacity: 0.8, width: 797.4306742682112, height: 188.7697972084052, radius: 50, fontSize: 32, fontFamily: 'Outfit', fontStyle: 'normal', textDecoration: '', rotation: -95.45246335665713, name: 'Streifen 3' },
            { id: 'cd9245ee-a80c-4551-b2a7-70e4f19098ac', type: 'text', x: 40, y: 805.2198067632843, fill: '#FFFFFF', opacity: 1, width: 243.38404688646133, height: 27.8, text: 'http://moxd.io/beamcontrol', fontSize: 14, fontFamily: 'Inter', fontStyle: 'bold', textDecoration: '', rotation: 0, name: 'URL', lockedSections: ['content'] },
            { id: '1771778473735', type: 'image', x: 438.6662438280946, y: 782.3927168105988, width: 45.65417990537094, height: 45.65417990537102, src: 'https://pbs.twimg.com/profile_images/700097477060460545/Ws5uPb2t_400x400.png', rotation: 0, opacity: 1, objectFit: 'cover', name: 'Logo', lockedSections: ['content'] },
            { id: 'ece2c108-2a9e-443f-83f6-f9e19b76a8a9', type: 'text', x: 494, y: 794.8792270531392, fill: '#FFFFFF', opacity: 1, width: 113.21980574130454, height: 20.68, text: 'moxd lab', fontSize: 18, fontFamily: 'Inter', fontStyle: 'bold', textDecoration: '', rotation: 0, name: 'Lab-Name', lockedSections: ['content'] }
        ]
    }
];
