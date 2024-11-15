import AppBar from '../AppBar/AppBar.jsx';
import { Toaster } from 'react-hot-toast';


export default function Layout({ children }) {
    return (
        <div className="container">
            <AppBar />
            {children}
            <Toaster position="top-center" reverseOrder={false} />
        </div>
    )
}