// scripts/seed-firebase.js
// Script to seed INITIAL_DB data to Firebase Cloud Firestore

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

if (!firebaseConfig.projectId) {
  console.error('Error: VITE_FIREBASE_PROJECT_ID must be set in environment variables.');
  process.exit(1);
}

console.log(`Connecting to Firebase project: ${firebaseConfig.projectId}...`);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const INITIAL_DB = {
  settings: {
    id: 'default',
    storeName: 'FREONIX XII-F1',
    eventDate: '2026-09-23',
    eventDateDisplay: '23 September 2026',
    adminPhone: '6287856624994',
    currency: 'IDR',
    lowStockThreshold: 5,
    storeStatus: 'open',
    orderPrefix: 'FRX',
    updatedAt: new Date().toISOString()
  },
  categories: [
    {
      id: 'cat-1',
      name: 'Makanan Ringan',
      slug: 'makanan-ringan',
      description: 'Street food & jajanan gurih khas kepulauan Filipina',
      status: 'active',
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 'cat-2',
      name: 'Makanan Utama',
      slug: 'makanan-utama',
      description: 'Hidangan lauk lezat dengan bumbu marinasi kaya rempah',
      status: 'active',
      createdAt: '2026-09-01T10:00:00.000Z'
    },
    {
      id: 'cat-3',
      name: 'Minuman & Dessert',
      slug: 'minuman-dessert',
      description: 'Pencuci mulut manis dan minuman segar tradisional',
      status: 'active',
      createdAt: '2026-09-01T10:00:00.000Z'
    }
  ],
  products: [
    {
      id: 'kwek-kwek',
      slug: 'kwek-kwek',
      name: 'Kwek Kwek',
      categoryId: 'cat-1',
      categoryName: 'Makanan Ringan',
      price: 2000,
      discountPrice: 0,
      stock: 45,
      unit: 'pcs',
      status: 'active',
      desc: 'Jajanan kaki lima khas Filipina berupa telur puyuh rebus yang dibalut adonan tepung berwarna oranye dan digoreng hingga renyah.',
      image: '/produk-kwek-kwek.jpg',
      waLink: 'https://wa.link/kdmsu4',
      ingredients: [
        'Telur puyuh (direbus & dikupas)',
        'Tepung terigu & maizena',
        'Pewarna makanan oranye alami (Annatto)',
        'Garam, kaldu bubuk, & merica',
        'Air mineral',
        'Minyak goreng'
      ],
      tools: [
        'Mangkuk adonan',
        'Pengaduk (Whisk)',
        'Wajan penggorengan',
        'Saringan minyak',
        'Tusuk sate bambu'
      ],
      nutrition: [
        { label: 'Kalori', value: '150 kkal' },
        { label: 'Protein', value: '6 g' },
        { label: 'Lemak', value: '10 g' },
        { label: 'Karbohidrat', value: '8 g' }
      ],
      updatedAt: '2026-09-06T12:00:00.000Z'
    },
    {
      id: 'chicken-adobo',
      slug: 'chicken-adobo',
      name: 'Chicken Adobo',
      categoryId: 'cat-2',
      categoryName: 'Makanan Utama',
      price: 15000,
      discountPrice: 0,
      stock: 28,
      unit: 'porsi',
      status: 'active',
      desc: 'Hidangan nasional Filipina berupa potongan ayam yang dimasak perlahan dalam campuran kecap asin, cuka, bawang putih, dan merica hitam hingga meresap sempurna.',
      image: '/produk-chicken-adobo.jpg',
      waLink: 'https://wa.link/y1k3hz',
      ingredients: [
        'Daging ayam segar (potong sedang)',
        'Kecap asin pekat',
        'Cuka putih / cuka aren',
        'Bawang putih (geprek kasar)',
        'Biji lada hitam utuh',
        'Daun salam kering (Bay leaves)',
        'Sedikit gula pasir',
        'Air & Minyak goreng'
      ],
      tools: [
        'Pisau daging',
        'Talenan tebal',
        'Panci atau Wajan tertutup',
        'Spatula kayu'
      ],
      nutrition: [
        { label: 'Kalori', value: '250 kkal' },
        { label: 'Protein', value: '25 g' },
        { label: 'Lemak', value: '12 g' },
        { label: 'Karbohidrat', value: '5 g' }
      ],
      updatedAt: '2026-09-06T12:00:00.000Z'
    },
    {
      id: 'halo-halo',
      slug: 'halo-halo',
      name: 'Halo-Halo',
      categoryId: 'cat-3',
      categoryName: 'Minuman & Dessert',
      price: 5000,
      discountPrice: 0,
      stock: 35,
      unit: 'cup',
      status: 'active',
      desc: 'Pencuci mulut es serut ikonik dari Filipina dengan campuran ube (ubi ungu), susu evaporasi, dan aneka isian menyegarkan.',
      image: '/produk-halo-halo.jpg',
      waLink: 'https://wa.link/ukep08',
      ingredients: [
        'Es batu kristal',
        'Susu evaporasi cair',
        'Ube Halaya (selai ubi ungu)',
        'Kacang merah manis',
        'Nata de coco & jelly',
        'Irisan pisang raja matang',
        'Nangka manis',
        'Es krim Ube (opsional)',
        'Gula aren cair'
      ],
      tools: [
        'Mesin penyerut es / blender es',
        'Gelas cup plastik saji',
        'Sendok panjang',
        'Wadah penyimpanan isian'
      ],
      nutrition: [
        { label: 'Kalori', value: '300 kkal' },
        { label: 'Protein', value: '8 g' },
        { label: 'Lemak', value: '6 g' },
        { label: 'Karbohidrat', value: '55 g' }
      ],
      updatedAt: '2026-09-06T12:00:00.000Z'
    }
  ]
};

async function seed() {
  try {
    console.log('Seeding store_settings...');
    await setDoc(doc(db, 'store_settings', 'default'), INITIAL_DB.settings, { merge: true });

    console.log('Seeding categories...');
    for (const cat of INITIAL_DB.categories) {
      await setDoc(doc(db, 'categories', cat.id), cat, { merge: true });
    }

    console.log('Seeding products...');
    for (const prod of INITIAL_DB.products) {
      await setDoc(doc(db, 'products', prod.id), prod, { merge: true });
    }

    console.log('Database seeded successfully to Firebase Cloud Firestore!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
