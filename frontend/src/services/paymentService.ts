import api from "../lib/api";

export async function createSnapToken(bookingId:number): Promise<string> {
    const res = await api.post(`/api/bookings/${bookingId}/pay`);
    return res.data.snap_token;
}