import { Outlet } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";

export default function AuthProviderLayout() {
    return (
        <AuthProvider>
            <Outlet/>
        </AuthProvider>
    );
}