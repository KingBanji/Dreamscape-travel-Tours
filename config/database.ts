import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "config", ".data");

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, "users.json");
const BOOKINGS_FILE = path.join(DATA_DIR, "bookings.json");
const TOURS_FILE = path.join(DATA_DIR, "tours.json");

// Helper to read JSON files
const readData = (filePath: string, defaultData: any = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Database read error from ${filePath}:`, err);
    return defaultData;
  }
};

// Helper to write JSON files
const writeData = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Database write error to ${filePath}:`, err);
  }
};

// Generate default tours list
const DEFAULT_TOURS = [
  {
    id: "1",
    title: "Hidden Gem Shantumbu Falls Tour",
    destination: "Shantumbu Falls",
    price: 650,
    available_seats: 12,
    is_active: true,
    departure_date: "2026-06-15",
    image_url: "/tours/shantumbu.jpg"
  },
  {
    id: "2",
    title: "Kafue Wilderness & River Boat Group Tour",
    destination: "Kafue National Park",
    price: 11000,
    available_seats: 15,
    is_active: true,
    departure_date: "2026-06-20",
    image_url: "/tours/kafue.jpg"
  },
  {
    id: "3",
    title: "Weekend Mosi Explorer",
    destination: "Victoria Falls",
    price: 9100,
    available_seats: 8,
    is_active: true,
    departure_date: "2026-06-25",
    image_url: "/tours/victoria_falls.jpg"
  },
  {
    id: "4",
    title: "Luangwa Wild Predator Safari",
    destination: "South Luangwa",
    price: 22000,
    available_seats: 6,
    is_active: true,
    departure_date: "2026-07-01",
    image_url: "/tours/south_luangwa.jpg"
  },
  {
    id: "5",
    title: "Zambian Rivers & Wilderness Expedition",
    destination: "Kafue, Luangwa & Livingstone",
    price: 43000,
    available_seats: 4,
    is_active: true,
    departure_date: "2026-07-10",
    image_url: "/tours/rivers_wilderness.jpg"
  }
];

// Initialize default tours if not existing
if (!fs.existsSync(TOURS_FILE)) {
  writeData(TOURS_FILE, DEFAULT_TOURS);
}

const DEFAULT_USERS = [
  {
    id: "USR001",
    name: "Kalila Mwansa",
    email: "kalila@example.com",
    role: "traveler",
    phone: "+260971234567",
    created_at: "2026-05-20T10:00:00.000Z",
    updated_at: "2026-05-20T10:00:00.000Z"
  },
  {
    id: "USR002",
    name: "Chipo Banda",
    email: "chipo@example.com",
    role: "traveler",
    phone: "+260976543210",
    created_at: "2026-06-01T14:30:00.000Z",
    updated_at: "2026-06-01T14:30:00.000Z"
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: "b-seed-1",
    user_id: "USR001",
    tour_id: "1",
    seats: 2,
    total_price: 1300,
    notes: "VIP Anniversary Trip",
    status: "confirmed",
    created_at: "2026-05-21T09:15:00.000Z",
    updated_at: "2026-05-21T09:15:00.000Z"
  },
  {
    id: "b-seed-2",
    user_id: "USR001",
    tour_id: "3",
    seats: 1,
    total_price: 9100,
    notes: "Livingstone package",
    status: "confirmed",
    created_at: "2026-05-22T11:45:00.000Z",
    updated_at: "2026-05-22T11:45:00.000Z"
  },
  {
    id: "b-seed-3",
    user_id: "USR001",
    tour_id: "2",
    seats: 2,
    total_price: 22000,
    notes: "Group safari",
    status: "pending",
    created_at: "2026-05-23T15:20:00.000Z",
    updated_at: "2026-05-23T15:20:00.000Z"
  },
  {
    id: "b-seed-4",
    user_id: "USR002",
    tour_id: "1",
    seats: 1,
    total_price: 650,
    notes: "Weekend waterfall relaxation",
    status: "confirmed",
    created_at: "2026-06-02T08:10:00.000Z",
    updated_at: "2026-06-02T08:10:00.000Z"
  }
];

if (!fs.existsSync(USERS_FILE) || readData(USERS_FILE, []).length === 0) {
  writeData(USERS_FILE, DEFAULT_USERS);
}

if (!fs.existsSync(BOOKINGS_FILE) || readData(BOOKINGS_FILE, []).length === 0) {
  writeData(BOOKINGS_FILE, DEFAULT_BOOKINGS);
}

// Main query interface matching user requirements
export function query(sqlStatement: string, params: any[] = []): Promise<{ rows: any[] }> {
  return new Promise((resolve, reject) => {
    try {
      const sql = sqlStatement.trim();
      
      // Load current tables
      const users = readData(USERS_FILE, []);
      const bookings = readData(BOOKINGS_FILE, []);
      const tours = readData(TOURS_FILE, DEFAULT_TOURS);

      // Simple Transaction Control commands
      if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") {
        resolve({ rows: [] });
        return;
      }

      // 0. ALTER TABLE and CREATE TABLE commands (e.g., schema modifications or table creation)
      if (sql.startsWith("ALTER TABLE") || sql.startsWith("CREATE TABLE")) {
        resolve({ rows: [] });
        return;
      }

      // 1. SELECT * FROM tours WHERE is_active = true with optional dynamic filters
      if (sql.startsWith("SELECT * FROM tours WHERE is_active = true") || sql.startsWith("SELECT * FROM tours WHERE is_active = true")) {
        let filtered = tours.filter((t: any) => t.is_active === true);
        
        const destMatch = sql.match(/destination\s+ILIKE\s+\$(\d+)/i);
        if (destMatch) {
          const pIdx = parseInt(destMatch[1], 10) - 1;
          const searchVal = String(params[pIdx]).replace(/%/g, "").trim().toLowerCase();
          filtered = filtered.filter((t: any) => t.destination && t.destination.toLowerCase().includes(searchVal));
        }
        
        const minPriceMatch = sql.match(/price\s+>=\s+\$(\d+)/i);
        if (minPriceMatch) {
          const pIdx = parseInt(minPriceMatch[1], 10) - 1;
          const minPriceVal = Number(params[pIdx]);
          filtered = filtered.filter((t: any) => Number(t.price) >= minPriceVal);
        }
        
        const maxPriceMatch = sql.match(/price\s+<=\s+\$(\d+)/i);
        if (maxPriceMatch) {
          const pIdx = parseInt(maxPriceMatch[1], 10) - 1;
          const maxPriceVal = Number(params[pIdx]);
          filtered = filtered.filter((t: any) => Number(t.price) <= maxPriceVal);
        }
        
        const durationMatch = sql.match(/duration_days\s+=\s+\$(\d+)/i);
        if (durationMatch) {
          const pIdx = parseInt(durationMatch[1], 10) - 1;
          const durationVal = Number(params[pIdx]);
          filtered = filtered.filter((t: any) => Number(t.duration_days) === durationVal);
        }
        
        if (sql.includes("ORDER BY created_at DESC")) {
          // Sort descending
          filtered.sort((a: any, b: any) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
          });
        }
        
        resolve({ rows: filtered });
        return;
      }

      // 1b. SELECT * FROM tours WHERE id = $1 AND is_active = true
      if (sql.includes("FROM tours WHERE id") && sql.includes("is_active = true")) {
        const idParam = String(params[0]);
        const matched = tours.filter((t: any) => String(t.id) === idParam && t.is_active === true);
        resolve({ rows: matched });
        return;
      }

      // 1c. INSERT INTO tours
      if (sql.trim().startsWith("INSERT INTO tours")) {
        const newTour = {
          id: String(tours.length + 1),
          title: params[0],
          description: params[1] || "",
          destination: params[2],
          duration_days: Number(params[3] || 1),
          price: Number(params[4]),
          max_seats: Number(params[5] || 10),
          available_seats: Number(params[5] || 10),
          image_url: params[6] || null,
          departure_date: params[7],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        tours.push(newTour);
        writeData(TOURS_FILE, tours);
        resolve({ rows: [newTour] });
        return;
      }

      // 1d. UPDATE tours SET
      if (sql.trim().startsWith("UPDATE tours SET") && !sql.includes("SET is_active = false")) {
        const idParam = String(params[9]);
        let updatedTour: any = null;
        
        const nextTours = tours.map((t: any) => {
          if (String(t.id) === idParam) {
            updatedTour = {
              ...t,
              title: params[0] !== undefined && params[0] !== null ? params[0] : t.title,
              description: params[1] !== undefined && params[1] !== null ? params[1] : t.description,
              destination: params[2] !== undefined && params[2] !== null ? params[2] : t.destination,
              duration_days: params[3] !== undefined && params[3] !== null ? Number(params[3]) : t.duration_days,
              price: params[4] !== undefined && params[4] !== null ? Number(params[4]) : t.price,
              max_seats: params[5] !== undefined && params[5] !== null ? Number(params[5]) : t.max_seats,
              available_seats: params[5] !== undefined && params[5] !== null ? Number(params[5]) : t.available_seats,
              image_url: params[6] !== undefined && params[6] !== null ? params[6] : t.image_url,
              departure_date: params[7] !== undefined && params[7] !== null ? params[7] : t.departure_date,
              is_active: params[8] !== undefined && params[8] !== null ? params[8] : t.is_active,
              updated_at: new Date().toISOString()
            };
            return updatedTour;
          }
          return t;
        });
        
        if (updatedTour) {
          writeData(TOURS_FILE, nextTours);
          resolve({ rows: [updatedTour] });
        } else {
          resolve({ rows: [] });
        }
        return;
      }

      // 1e. SOFT DELETE: UPDATE tours SET is_active = false
      if (sql.includes("UPDATE tours SET is_active = false")) {
        const idParam = String(params[0]);
        const nextTours = tours.map((t: any) => {
          if (String(t.id) === idParam) {
            return { ...t, is_active: false, updated_at: new Date().toISOString() };
          }
          return t;
        });
        writeData(TOURS_FILE, nextTours);
        resolve({ rows: [] });
        return;
      }

      // 2. INSERT INTO bookings (user_id, tour_id, seats, total_price, notes, status) VALUES ($1... RETURNING *
      if (sql.includes("INSERT INTO bookings")) {
        const newBooking = {
          id: `b-${Date.now()}`,
          user_id: params[0],
          tour_id: String(params[1]),
          seats: Number(params[2]),
          total_price: Number(params[3]),
          notes: params[4] || null,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        bookings.push(newBooking);
        writeData(BOOKINGS_FILE, bookings);
        resolve({ rows: [newBooking] });
        return;
      }

      // 3. UPDATE tours SET available_seats = available_seats - $1 WHERE id = $2
      if (sql.includes("UPDATE tours SET available_seats = available_seats -")) {
        const seatsToDeduct = Number(params[0]);
        const tourId = String(params[1]);
        const updatedTours = tours.map((t: any) => {
          if (String(t.id) === tourId) {
            return { ...t, available_seats: Math.max(0, t.available_seats - seatsToDeduct) };
          }
          return t;
        });
        writeData(TOURS_FILE, updatedTours);
        resolve({ rows: [] });
        return;
      }

      // 4. RESTORE SEATS: UPDATE tours SET available_seats = available_seats + $1 WHERE id = $2
      if (sql.includes("UPDATE tours SET available_seats = available_seats +")) {
        const seatsToAdd = Number(params[0]);
        const tourId = String(params[1]);
        const updatedTours = tours.map((t: any) => {
          if (String(t.id) === tourId) {
            return { ...t, available_seats: t.available_seats + seatsToAdd };
          }
          return t;
        });
        writeData(TOURS_FILE, updatedTours);
        resolve({ rows: [] });
        return;
      }

      // 5. SELECT b.*, t.title AS tour_title, t.destination, t.departure_date, t.image_url FROM bookings b JOIN tours t ON b.tour_id = t.id WHERE b.user_id = $1 ORDER BY b.created_at DESC
      if (sql.includes("bookings b JOIN tours t") && sql.includes("WHERE b.user_id = $1")) {
        const userId = params[0];
        const joined = bookings
          .filter((b: any) => b.user_id === userId)
          .map((b: any) => {
            const tour = tours.find((t: any) => String(t.id) === String(b.tour_id));
            return {
              ...b,
              tour_title: tour ? tour.title : "Custom Adventure Tour",
              destination: tour ? tour.destination : "Shantumbu Wilds",
              departure_date: tour ? tour.departure_date : b.created_at.split("T")[0],
              image_url: tour ? tour.image_url : "/tours/shantumbu.jpg"
            };
          });
        joined.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        resolve({ rows: joined });
        return;
      }

      // 6. SELECT b.*, u.name AS user_name, u.email, t.title AS tour_title, t.destination FROM bookings b JOIN users u ON b.user_id = u.id JOIN tours t ON b.tour_id = t.id ORDER BY b.created_at DESC
      if (sql.includes("bookings b JOIN users u") && sql.includes("JOIN tours t")) {
        const joined = bookings.map((b: any) => {
          const u = users.find((usr: any) => usr.id === b.user_id);
          const t = tours.find((tur: any) => String(tur.id) === String(b.tour_id));
          return {
            ...b,
            user_name: u ? u.name : "Guest Traveler",
            email: u ? u.email : "guest@explorer.com",
            tour_title: t ? t.title : "Bespoke Custom Safari",
            destination: t ? t.destination : "Wilderness Zone"
          };
        });
        joined.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        resolve({ rows: joined });
        return;
      }

      // 7. SELECT * FROM bookings WHERE id = $1 AND user_id = $2
      if (sql.includes("FROM bookings WHERE id = $1 AND user_id = $2")) {
        const bId = params[0];
        const uId = params[1];
        const matched = bookings.filter((b: any) => b.id === bId && b.user_id === uId);
        resolve({ rows: matched });
        return;
      }

      // 8. SELECT * FROM bookings WHERE id = $1
      if (sql.includes("FROM bookings WHERE id = $1")) {
        const bId = params[0];
        const matched = bookings.filter((b: any) => b.id === bId);
        resolve({ rows: matched });
        return;
      }

      // 9. UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *
      if (sql.includes("UPDATE bookings SET status = $1") && sql.includes("RETURNING *")) {
        const nextStatus = params[0];
        const bookingId = params[1];
        let updatedBooking: any = null;
        const nextBookings = bookings.map((b: any) => {
          if (b.id === bookingId) {
            updatedBooking = { ...b, status: nextStatus, updated_at: new Date().toISOString() };
            return updatedBooking;
          }
          return b;
        });
        writeData(BOOKINGS_FILE, nextBookings);
        resolve({ rows: updatedBooking ? [updatedBooking] : [] });
        return;
      }

      // 10. UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2 (no RETURNING)
      if (sql.includes("UPDATE bookings SET status = $1") && sql.includes("WHERE id = $2")) {
        const nextStatus = params[0];
        const bookingId = params[1];
        const nextBookings = bookings.map((b: any) => {
          if (b.id === bookingId) {
            return { ...b, status: nextStatus, updated_at: new Date().toISOString() };
          }
          return b;
        });
        writeData(BOOKINGS_FILE, nextBookings);
        resolve({ rows: [] });
        return;
      }

      // 11. SELECT id FROM users WHERE email = $1
      if (sql.includes("SELECT id FROM users WHERE email = $1")) {
        const emailParam = String(params[0]).toLowerCase();
        const matched = users
          .filter((u: any) => u.email.toLowerCase() === emailParam)
          .map((u: any) => ({ id: u.id }));
        resolve({ rows: matched });
        return;
      }

      // 12. INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, 'traveler') RETURNING id, name, email...
      if (sql.includes("INSERT INTO users")) {
        const emailLower = String(params[1]).toLowerCase();
        const isPredefinedAdmin = emailLower === "luyandobanjilb@gmail.com";
        
        let passwordVal = params[2];
        let phoneVal = null;
        let roleVal = isPredefinedAdmin ? "admin" : "traveler";

        if (sql.includes("password_hash")) {
          // INSERT INTO users (name, email, password_hash, role)
          // params[2] contains the password hash, params[3] contains role
          passwordVal = params[2];
          roleVal = params[3] || (isPredefinedAdmin ? "admin" : "traveler");
        } else {
          phoneVal = params[3] || null;
        }

        const newUser = {
          id: `u-${Date.now()}`,
          name: params[0],
          email: emailLower,
          password: passwordVal, // raw or already hashed by bcrypt
          password_hash: passwordVal, // support both password and password_hash
          phone: phoneVal,
          role: roleVal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        users.push(newUser);
        writeData(USERS_FILE, users);
        
        // Remove password/password_hash for returned object
        const { password, password_hash, ...returnedUser } = newUser;
        resolve({ rows: [returnedUser] });
        return;
      }

      // 13. SELECT * FROM users WHERE email = $1
      if (sql.includes("SELECT * FROM users WHERE email = $1")) {
        const emailParam = String(params[0]).toLowerCase();
        const matched = users.filter((u: any) => u.email.toLowerCase() === emailParam);
        const resolvedMatched = matched.map((u: any) => ({
          ...u,
          password: u.password || u.password_hash,
          password_hash: u.password_hash || u.password
        }));
        resolve({ rows: resolvedMatched });
        return;
      }

      // 14. SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1
      if (sql.includes("SELECT id, name, email, phone, role, created_at FROM users WHERE id = $1")) {
        const idParam = params[0];
        const matched = users
          .filter((u: any) => u.id === idParam)
          .map(({ password, ...u }: any) => u);
        resolve({ rows: matched });
        return;
      }

       // SELECT id, name, email, phone, role, created_at FROM users (and general users query)
      if (sql.includes("SELECT id, name, email, phone, role, created_at FROM users") || sql.includes("SELECT * FROM users")) {
        const list = users.map(({ password, password_hash, ...u }: any) => u);
        resolve({ rows: list });
        return;
      }

      // UPDATE users support
      if (sql.includes("UPDATE users SET") || sql.includes("UPDATE users")) {
        const idParam = params[params.length - 1];
        let updatedUser: any = null;
        
        const nextUsers = users.map((u: any) => {
          if (u.id === idParam || (typeof idParam === "string" && u.id.toLowerCase() === idParam.toLowerCase())) {
            updatedUser = { ...u };
            
            if (sql.includes("phone =")) {
              const phoneIdx = sql.indexOf("phone =") !== -1 ? sql.slice(0, sql.indexOf("phone =")).split("$").length - 1 : -1;
              if (phoneIdx >= 0 && phoneIdx < params.length) {
                updatedUser.phone = params[phoneIdx];
              }
            }
            if (sql.includes("mfa_enabled =")) {
              const mfaIdx = sql.indexOf("mfa_enabled =") !== -1 ? sql.slice(0, sql.indexOf("mfa_enabled =")).split("$").length - 1 : -1;
              if (mfaIdx >= 0 && mfaIdx < params.length) {
                updatedUser.mfa_enabled = params[mfaIdx];
              }
            }
            if (sql.includes("temp_otp =")) {
              const otpIdx = sql.indexOf("temp_otp =") !== -1 ? sql.slice(0, sql.indexOf("temp_otp =")).split("$").length - 1 : -1;
              if (otpIdx >= 0 && otpIdx < params.length) {
                updatedUser.temp_otp = params[otpIdx];
              }
            }
            if (sql.includes("temp_otp_expiry =")) {
              const expiryIdx = sql.indexOf("temp_otp_expiry =") !== -1 ? sql.slice(0, sql.indexOf("temp_otp_expiry =")).split("$").length - 1 : -1;
              if (expiryIdx >= 0 && expiryIdx < params.length) {
                updatedUser.temp_otp_expiry = params[expiryIdx];
              }
            }
            
            updatedUser.updated_at = new Date().toISOString();
            return updatedUser;
          }
          return u;
        });

        if (updatedUser) {
          writeData(USERS_FILE, nextUsers);
          // Remove password fields for standard security return
          const { password, password_hash, ...returnedUser } = updatedUser;
          resolve({ rows: [returnedUser] });
        } else {
          resolve({ rows: [] });
        }
        return;
      }

      // DELETE FROM users WHERE id = $1
      if (sql.includes("DELETE FROM users WHERE id = $1") || sql.includes("DELETE FROM users WHERE id =")) {
        const idParam = params[0];
        const nextUsers = users.filter((u: any) => u.id !== idParam);
        writeData(USERS_FILE, nextUsers);
        resolve({ rows: [] });
        return;
      }

      // General default return to be safe
      resolve({ rows: [] });
    } catch (err) {
      reject(err);
    }
  });
}
