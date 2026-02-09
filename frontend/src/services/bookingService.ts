export type CreateBookingPayLoad = {
    serviceId: number;
    date: string;
    time: string;
    address: string;
    notes?: string;
};

export type BookingStatus = "CONFIRMED";

export type Booking = {
    id: string;
    serviceId: number;
    date: string;
    time: string;
    address: string;
    notes?: string;
    status: BookingStatus;
    createdAt: string;
}

export type createBookingResponse = {
    bookingId: String;
    status: BookingStatus;
};

const STORAGE_KEY = "cleaning_bookings";

function loadBookings(): Booking[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return [];

    try {
        return JSON.parse(raw) as Booking[];
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return[];
    }
}

function saveBookings(bookings: Booking[]){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}

let bookingsDB: Booking[] = loadBookings();

export async function createBooking (
    payload: CreateBookingPayLoad
): Promise<createBookingResponse> {
    return new Promise((resolve, reject) => {
        setTimeout(() =>{
            if(!payload.address || payload.address.length < 5){
                reject(new Error("Address is too short"));
                return;
            }

            const newBooking: Booking = {
                id: Math.random().toString(35).substring(2, 10),
                serviceId: payload.serviceId,
                date: payload.date,
                time: payload.time,
                address: payload.address,
                notes: payload.notes,
                status: "CONFIRMED",
                createdAt: new Date().toISOString(),
            };

            bookingsDB.unshift(newBooking);
            saveBookings(bookingsDB);
            
            resolve({
                bookingId: newBooking.id,
                status: newBooking.status,
            });
        }, 800);
    });
}

export async function getMyBookings(): Promise<Booking[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(bookingsDB);
        }, 500);
    });
}