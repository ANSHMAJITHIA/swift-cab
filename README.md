# 🚖 SwiftCab India - Full Stack MERN Cab & Auto Booking App

A production-ready **MERN Stack Ride-Hailing Application** localized for **India** (with Indian Rupee **₹ INR**, iconic 3-wheeler **Auto-Rickshaws**, Bike Taxis, Cabs, and major Indian cities like **Delhi NCR, Mumbai, Bengaluru, Hyderabad**, plus **Global / World Mode**).

Built with **MongoDB, Express.js, React.js, Node.js, Socket.IO WebSockets, Leaflet Maps, and Stripe**.

---

## 🇮🇳 India & World Map Integration

### 🏙️ Supported Regions & Cities
- 🏛️ **Delhi NCR**: Connaught Place, India Gate, IGI Airport T3, Cyber Hub Gurugram, Noida Sector 18, Hauz Khas.
- 🌊 **Mumbai**: Marine Drive, Bandra Kurla Complex (BKC), CSMT Railway Station, Mumbai T2 Airport.
- 💻 **Bengaluru**: MG Road, Koramangala, Indiranagar 100ft Road, Kempegowda Airport (BLR).
- 🏰 **Hyderabad**: Hitec City Cyber Towers, Charminar Heritage Plaza.
- 🌐 **Global / World**: Dubai (Burj Khalifa), New York (Times Square), London (London Bridge).

*(Use the interactive **Select Region** pill bar at the top of the map to jump between Indian cities or World destinations in 1 click!)*

---

## 🚗 Indian Vehicle Categories & Fares (₹ INR)

| Vehicle | Icon | Description | Base Fare | Per KM | Capacity |
|---|---|---|---|---|---|
| **UberAuto** | 🛺 | Iconic auto-rickshaw at your doorstep | ₹35 | ₹11/km | 3 Seats |
| **Uber Moto** | 🏍️ | Quick & pocket-friendly bike ride | ₹25 | ₹8.5/km | 1 Seat |
| **UberGo** | 🚗 | Affordable compact AC hatchback (WagonR / Swift) | ₹55 | ₹14/km | 4 Seats |
| **Premier** | 🚘 | Comfortable AC sedan (Dzire / Honda City) | ₹85 | ₹18/km | 4 Seats |
| **UberXL** | 🚙 | Spacious 6-seater SUV (Ertiga / Innova) | ₹130 | ₹24/km | 6 Seats |

---

## 🌟 Key Features

1. **Dual Role Auth & Indian Profiles**:
   - Indian phone numbers (`+91 98...`) and license plates (`DL 01 AB 7842`, `KA 03 MP 9012`).
   - 1-Click fast login with pre-seeded test accounts.
2. **Interactive Map & Ride Booking**:
   - OpenStreetMap & Leaflet with zero API key failures.
   - Click anywhere on the India map to set pickup or drop-off points.
   - 4-Digit Trip Security PIN (OTP) generated for each ride.
3. **Driver Dispatch Console**:
   - Online/Offline toggle with radar pulse animation.
   - 25-second countdown alert on incoming ride requests with estimated earnings in ₹.
   - Step-by-step trip workflow: *Arrive at Pickup* ➔ *Verify 4-Digit OTP* ➔ *Start Trip* ➔ *Complete & Collect Payment*.
4. **GPS Driving Simulator**:
   - Click *"Simulate Car Driving"* to watch the vehicle marker move smoothly along the route in real-time!
5. **Real-Time WebSockets**:
   - Instant dispatching, live driver GPS streaming, and in-ride live chat.
6. **Payments & Digital Receipts**:
   - In-app wallet with simulated top-ups (`+₹100`, `+₹250`, `+₹500`, `+₹1000`).
   - Stripe Card / UPI / Cash payment options.
   - Printable receipts with 5% GST & platform fee itemization.

---

## 👥 Demo Accounts (1-Click Login)

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Rider** | Rahul Sharma | `rider@demo.com` | `password123` | Balance: ₹1,250 |
| **Driver 1** | Rajesh Kumar | `driver@demo.com` | `password123` | Maruti Suzuki Dzire (White) • DL 01 AB 7842 |
| **Driver 2** | Amit Verma | `driver2@demo.com` | `password123` | Honda City (Silver) • DL 03 CD 9901 |
| **Driver 3** | Ramesh Auto Driver | `driver3@demo.com` | `password123` | Bajaj Compact Auto (Green-Yellow) • DL 1R A 3341 |

---

## 🚀 How to Run the Project

The application is already running!
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

To start manually at any time:
```powershell
npm run dev
```
*(To re-seed Indian demo data at any time: `npm run seed`)*
