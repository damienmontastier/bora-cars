AIRTABLE (hub central)
├── Véhicules        ← source de vérité principale
│   └── nom, marque, modèle, couleur, immat, prix, dispo...
├── Clients
├── Propriétaires
├── Réservations
├── Contrats / Dossiers
└── Stats (views Airtable)

        ↓ API REST Airtable (lecture)

SANITY STUDIO
└── Fiche véhicule enrichie
    ├── [sync depuis Airtable] nom, marque, modèle, couleur
    └── [ajouté dans Sanity] 0-100, bluetooth, photos HD, description...

        ↓ API Sanity (lecture)

SITE INTERNET